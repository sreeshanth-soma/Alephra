import { NextRequest, NextResponse } from 'next/server';

const maskKey = (k?: string) => {
  if (!k) return 'NONE';
  if (k.length <= 8) return '****';
  return `${k.substring(0, 4)}...${k.substring(k.length - 4)}`;
};

export async function POST(request: NextRequest) {
  try {
    const t0 = Date.now();
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('Received audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    });

    // Create FormData for Sarvam AI API
    const sarvamFormData = new FormData();
    sarvamFormData.append('file', audioFile);

    // Call Sarvam AI API directly using configured key
    const apiKey = process.env.SARVAM_API_KEY;
    console.log('Sarvam API key present:', !!apiKey, 'masked:', maskKey(apiKey));
    if (!apiKey) throw new Error('SARVAM_API_KEY not configured');

    const tApiStart = Date.now();
    const sarvamResponse = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: sarvamFormData,
    });
    const tApiEnd = Date.now();

    if (!sarvamResponse.ok) {
      const errorText = await sarvamResponse.text();
      console.error('Sarvam AI API error:', sarvamResponse.status, errorText);
      throw new Error(`Sarvam AI API error: ${sarvamResponse.status} - ${errorText}`);
    }

    const result = await sarvamResponse.json();
    console.log('Sarvam AI result:', result);

    // Handle different response formats from Sarvam AI
    let extractedText = '';
    let detectedLanguage = 'en';

    if (typeof result === 'string') {
      extractedText = result;
    } else if (result.text) {
      extractedText = result.text;
    } else if (result.transcript) {
      extractedText = result.transcript;
    } else if (result.translation) {
      extractedText = result.translation;
    } else if (result.result) {
      extractedText = result.result;
    } else if (result.data && result.data.text) {
      extractedText = result.data.text;
    } else {
      console.log('Unexpected response format:', result);
      extractedText = 'No text detected';
    }

    if (result.language) {
      detectedLanguage = result.language;
    } else if (result.source_language) {
      detectedLanguage = result.source_language;
    } else if (result.detected_language) {
      detectedLanguage = result.detected_language;
    }

    const tEnd = Date.now();
    const timings = {
      totalMs: tEnd - t0,
      providerMs: tApiEnd - tApiStart
    };
    const serverTiming = [`total;dur=${timings.totalMs}`, `provider;dur=${timings.providerMs}`].join(', ');

    return NextResponse.json({ 
      success: true, 
      text: extractedText.trim(),
      language: detectedLanguage,
      timings
    }, { headers: { 'Server-Timing': serverTiming } });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to process speech-to-text',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
