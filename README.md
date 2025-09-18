# MedScan - AI Medical Report Analysis

<div align="center">
  <h3>🤖 AI-Powered Medical Report Analysis & Chat Assistant</h3>
  <p>Upload medical reports and get intelligent insights with conversational AI</p>
</div>

---

## ✨ Features

- 📄 **Report Upload**: Support for PDF and image formats
- 🧠 **AI Analysis**: Powered by Google Gemini 1.5 Flash
- 💬 **Interactive Chat**: Ask questions about your medical reports
- 🔍 **Smart Retrieval**: Enhanced answers using Pinecone vector database
- 🎨 **Modern UI**: Built with Next.js 14, Tailwind CSS, and Radix UI
- 📱 **Responsive Design**: Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key
- Pinecone API key

### Installation

```bash
# Clone the repository
git clone https://github.com/SowmithBachu/MedScan.git
cd MedScan

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Environment Setup

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_google_generative_ai_key
PINECONE_API_KEY=your_pinecone_key
```

### Pinecone Configuration

If you use a different Pinecone setup, adjust the settings in `app/config.ts`:

```typescript
export const indexName = "index-one"
export const namespace = "diagnosis2"
export const topK = 5
export const modelname = 'mixedbread-ai/mxbai-embed-large-v1'
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### API Endpoints

- **Report Extraction**: `POST /api/extractreportgemini`
  - Extracts text from medical reports using Gemini 1.5 Flash
  - Supports PDF and image formats

- **Medical Chat**: `POST /api/medichatgemini`
  - Conversational AI with report context
  - Enhanced with Pinecone vector retrieval

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI**: Google Gemini 1.5 Flash
- **Vector DB**: Pinecone
- **Deployment**: Vercel-ready

## 📖 API Usage

### Extract Medical Report

```bash
POST /api/extractreportgemini
Content-Type: application/json

{
  "base64": "data:application/pdf;base64,...."
}
```

### Chat with Report Context

```bash
POST /api/medichatgemini
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "What are the key findings in this report?" }
  ],
  "data": { "reportData": "<extracted_report_text>" }
}
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing API keys | Ensure `GEMINI_API_KEY` and `PINECONE_API_KEY` are set in `.env.local` |
| Rate limits | Retry later or reduce request frequency |
| Build errors | Check Node.js version (18+) and run `npm install` |

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Sowmith Bachu**
- GitHub: [@SowmithBachu](https://github.com/SowmithBachu)

---

<div align="center">
  <p>Made with ❤️ for better healthcare insights</p>
</div>