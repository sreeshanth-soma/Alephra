// Lightweight embedding server for MedScan (MCP-like local service)
// - POST /embed { texts: string[] }
// - GET /health
// - Uses @xenova/transformers locally with batching, mean pooling, normalization
// - Includes LRU cache to speed up repeated inputs

import http from 'node:http'
import { createHash } from 'node:crypto'

let pipelineRef = null
async function getPipeline() {
  if (!pipelineRef) {
    const mod = await import('@xenova/transformers')
    pipelineRef = mod.pipeline
  }
  return pipelineRef
}

const PORT = Number(process.env.MCP_EMBED_PORT || 8787)
const HOST = process.env.MCP_EMBED_HOST || '127.0.0.1'
const MODEL = process.env.EMBEDDING_MODEL || 'mixedbread-ai/mxbai-embed-large-v1'

class LRUCache {
  constructor(limit) {
    this.limit = limit
    this.map = new Map()
  }
  _touch(key, entry) {
    this.map.delete(key)
    this.map.set(key, entry)
  }
  get(key) {
    if (!this.map.has(key)) return undefined
    const entry = this.map.get(key)
    this._touch(key, entry)
    return entry
  }
  set(key, value) {
    if (this.map.has(key)) this.map.delete(key)
    this.map.set(key, value)
    if (this.map.size > this.limit) {
      const firstKey = this.map.keys().next().value
      this.map.delete(firstKey)
    }
  }
}

const cache = new LRUCache(Number(process.env.EMBED_CACHE_SIZE || 500))

function sha256(input) {
  return createHash('sha256').update(input).digest('hex')
}

async function readJson(req) {
  return await new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => (data += chunk))
    req.on('end', () => {
      try {
        const json = data ? JSON.parse(data) : {}
        resolve(json)
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

async function handleEmbed(texts) {
  if (!Array.isArray(texts)) throw new Error('texts must be an array')
  const keys = texts.map(t => sha256(MODEL + '|' + String(t)))
  const results = new Array(texts.length)
  const cachedFlags = new Array(texts.length)

  for (let i = 0; i < texts.length; i++) {
    const hit = cache.get(keys[i])
    if (hit) {
      results[i] = hit
      cachedFlags[i] = true
    }
  }

  const missing = []
  for (let i = 0; i < texts.length; i++) if (!results[i]) missing.push(i)
  if (missing.length > 0) {
    const pl = await getPipeline()
    const extractor = await pl('feature-extraction', MODEL)
    const batchSize = Number(process.env.EMBED_BATCH_SIZE || 8)
    for (let start = 0; start < missing.length; start += batchSize) {
      const slice = missing.slice(start, start + batchSize)
      const inputs = slice.map(i => texts[i])
      const outputs = await extractor(inputs, { pooling: 'mean', normalize: true })
      const vectors = Array.isArray(outputs) ? outputs : [outputs]
      for (let j = 0; j < slice.length; j++) {
        const idx = slice[j]
        let v = vectors[j]
        if (v && typeof v === 'object' && 'data' in v && Array.isArray(v.data) === false) {
          v = v.data
        }
        if (Array.isArray(v) && v.length === 1 && Array.isArray(v[0])) {
          v = v[0]
        }
        const vecArr = Array.from(v)
        const vec = vecArr.map((x) => Number(x))
        results[idx] = vec
        cachedFlags[idx] = false
        cache.set(keys[idx], vec)
      }
    }
  }

  const dims = results[0]?.length || 0
  return { embeddings: results, model: MODEL, dims, cached: cachedFlags }
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'POST' && req.url === '/embed') {
    try {
      const body = await readJson(req)
      const { texts } = body
      const t0 = Date.now()
      const out = await handleEmbed(texts)
      const dt = Date.now() - t0
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true, elapsedMs: dt, ...out }))
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: false, error: e instanceof Error ? e.message : 'Unknown error' }))
    }
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', model: MODEL }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`[embedding-server] listening on http://${HOST}:${PORT} model=${MODEL}`)
})


