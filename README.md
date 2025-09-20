# MedScan

**MedScan** is an AI-powered healthcare intelligence platform designed to revolutionize how individuals interact with their medical data. Leveraging advanced AI models, vector databases, and multi-language voice capabilities, MedScan provides intelligent analysis of medical reports, personalized health insights, and an intuitive conversational interface.

## ✨ Key Features

-   **AI-Powered Medical Report Analysis**: Utilize Google Gemini to analyze medical reports, extract key information, and summarize findings. Supports image-based report uploads with automatic text extraction.
-   **Retrieval-Augmented Generation (RAG)**: Integrates with Pinecone vector database and HuggingFace embeddings (`mixedbread-ai/mxbai-embed-large-v1`) to retrieve relevant clinical findings and enrich AI responses, ensuring accuracy and context-awareness.
-   **Multi-Language Voice Assistant**: A conversational AI powered by Sarvam AI for Speech-to-Text (STT) and Text-to-Speech (TTS), and Google Gemini for natural language understanding. Supports multiple Indian languages for inclusive healthcare access.
-   **Interactive Radial Orbital Timeline**: An engaging visual component on the landing page that showcases MedScan's core features and their interconnectedness through a dynamic, clickable orbital interface.
-   **Comprehensive Health Dashboard**: A personalized dashboard to track vital signs (heart rate, SpO2), manage medications, view lab results, set medical reminders, and organize appointments.
-   **Prescription History & Management**: Securely stores and manages past medical reports and prescriptions, allowing users to query their entire medical history.
-   **Dynamic UI with Animations**: Built with Next.js, React, and Tailwind CSS, featuring smooth animations powered by Framer Motion for an enhanced user experience.

## 🛠️ Technologies Used

-   **Framework**: Next.js 14 (React)
-   **Styling**: Tailwind CSS
-   **AI/ML**: Google Gemini (LLM), HuggingFace Inference (Embeddings via `mixedbread-ai/mxbai-embed-large-v1`)
-   **Vector Database**: Pinecone
-   **Voice AI**: Sarvam AI (Speech-to-Text, Text-to-Speech)
-   **Animations**: Framer Motion
-   **Charts**: Recharts
-   **Authentication**: Google OAuth (currently simplified for demo purposes)
-   **Deployment**: Vercel (recommended)

## 🚀 Setup & Installation

Follow these steps to get MedScan up and running on your local machine.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/MedScan.git
cd MedScan
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
PINECONE_API_KEY=YOUR_PINECONE_API_KEY
HF_TOKEN=YOUR_HUGGINGFACE_TOKEN
SARVAM_API_KEY=YOUR_SARVAM_AI_API_KEY
AUTH_SECRET=YOUR_AUTH_SECRET_FOR_JWT
```

-   **`NEXT_PUBLIC_GOOGLE_CLIENT_ID`**: Obtain this from Google Cloud Console for OAuth.
-   **`GOOGLE_CLIENT_SECRET`**: Google OAuth client secret.
-   **`GEMINI_API_KEY`**: Your API key for Google Gemini (can be obtained from Google AI Studio).
-   **`PINECONE_API_KEY`**: Your API key for Pinecone (vector database).
-   **`HF_TOKEN`**: Your HuggingFace API token for embedding models.
-   **`SARVAM_API_KEY`**: Your API key for Sarvam AI (Speech-to-Text & Text-to-Speech services).
-   **`AUTH_SECRET`**: A strong, random string for JWT signing. You can generate one using `openssl rand -base64 32`.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 💡 Usage

1.  **Landing Page (`/`)**: Explore MedScan's features through the interactive radial timeline.
2.  **Analysis Page (`/analysis`)**: Upload medical reports (images) for AI analysis and chat with the AI about your reports. You can also view and select from your prescription history.
3.  **Dashboard Page (`/dashboard`)**: Access a comprehensive overview of your health metrics, including vitals, lab results, medications, and reminders. Navigate to specific sections like `/dashboard/vitals`, `/dashboard/labs`, etc.
4.  **Voice Agent Page (`/voice`)**: Interact with the AI using your voice, ask questions about your health, and receive spoken responses in multiple Indian languages.

## 📂 Project Structure

```
MedScan-phase1/
├── app/                      # Next.js app router: pages, API routes, and global config
│   ├── analysis/             # Medical report upload & AI chat interface
│   ├── api/                  # Backend API routes (Gemini chat, report extraction, voice, auth)
│   ├── dashboard/            # Health dashboard with sub-pages (vitals, labs, timeline, questions, devices)
│   ├── voice/                # Voice AI assistant interface
│   ├── globals.css           # Global CSS styles
│   ├── layout.tsx            # Root layout for the application
│   └── page.tsx              # Landing page
├── components/               # Reusable UI components
│   ├── chat/                 # Chat UI components (chatcomponent, messagebox, messages)
│   ├── ui/                   # Shadcn/ui components (button, card, input, etc.) and custom UI (lamp, container-scroll-animation, radial-orbital-timeline)
│   ├── RadialOrbitalTimelineDemo.tsx # Demo data and usage of RadialOrbitalTimeline
│   ├── PrescriptionHistory.tsx # Component for displaying prescription history
│   └── ReportComponent.tsx   # Component for uploading and confirming reports
├── lib/                      # Utility functions and libraries (e.g., prescription-storage, utils)
├── public/                   # Static assets (images, fonts)
├── utils.ts                  # General utility functions (e.g., Pinecone vector store interactions, embedding generation)
├── middleware.ts             # Next.js middleware
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation
```

---

MedScan is an ongoing project, and contributions are welcome!
