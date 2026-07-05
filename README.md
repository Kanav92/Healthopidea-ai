
# Healthopedia AI

A full-stack medical Q&A platform combining RAG-based AI chat with a community prompt-sharing system. Users can ask medical questions and get answers grounded in the Gale Encyclopedia of Medicine, with real-time streaming responses and persistent chat memory — alongside a social feed for sharing and discovering AI health prompts.

---

## Features

### AI Medical Assistant
- **RAG-based Q&A** — answers grounded in a real medical reference (Gale Encyclopedia of Medicine), not just raw LLM knowledge
- **Streaming responses** — token-by-token streaming via FastAPI `StreamingResponse` + Next.js `ReadableStream`
- **Conversational memory** — follow-up questions work correctly across a session
- **Chat history** — past sessions saved to MongoDB, resume any conversation from the sidebar

### Community Prompt Sharing
- Create, edit, delete AI health prompts
- Public feed with tag-based search and username filtering
- User profile pages showing contributed prompts
- Copy-to-clipboard for any prompt
- Google OAuth authentication via NextAuth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + Tailwind CSS |
| Authentication | NextAuth.js (Google OAuth) |
| Database | MongoDB Atlas + Mongoose |
| AI Backend | FastAPI (Python) |
| LLM | Groq API — Llama 3.3 70B |
| RAG Orchestration | LangChain |
| Embeddings | BAAI/bge-small-en-v1.5 (sentence-transformers) |
| Vector Store | FAISS |
| Document Loader | LangChain PyPDFLoader |

---

## Architecture

### One-time Ingestion (run once)
Gale Encyclopedia PDF
→ PyPDFLoader
→ RecursiveCharacterTextSplitter (chunk_size=500, overlap=50)
→ BAAI/bge-small-en-v1.5 embeddings
→ FAISS vector index saved to disk

### Runtime Flow (per message)
User message (Next.js)
→ FastAPI /chat endpoint
→ Load session memory from MongoDB
→ FAISS retriever fetches top-5 relevant chunks
→ LangChain prompt: context + history + question
→ Groq (Llama 3.3 70B) streams response
→ StreamingResponse → ReadableStream → live UI rendering
→ Save messages to MongoDB on completion

---

## Project Structure
healthopedia-ai/
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── chat/page.js
│   ├── create-prompt/page.js
│   ├── update-prompt/page.js
│   ├── profile/[id]/page.js
│   └── api/
│       ├── auth/[...nextauth]/route.js
│       └── prompts/route.js
├── components/
│   ├── Nav.jsx
│   ├── Feed.jsx
│   ├── Form.jsx
│   ├── Profile.jsx
│   ├── PromptCard.jsx
│   ├── Provider.jsx
│   └── Chat.jsx
├── models/
│   ├── User.js
│   ├── Prompt.js
│   └── Chat.js
├── lib/
│   └── mongodb.js
└── healthopedia_backend/
├── ingest.py
├── requirements.txt
└── app/
├── main.py
└── rag/
├── retriever.py
├── chain.py
└── memory.py

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (free tier)
- Groq API key (free at console.groq.com)
- Google OAuth credentials (Google Cloud Console)

### 1. Clone and install frontend dependencies
```bash
git clone https://github.com/Kanav92/Healthopidea-ai.git
cd Healthopidea-ai
npm install
```

### 2. Create `.env.local` in root
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MONGODB_URI=your_mongodb_atlas_uri
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000

### 3. Install Python dependencies
```bash
cd healthopedia_backend
pip install -r requirements.txt
```

### 4. Create `healthopedia_backend/.env`
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=your_mongodb_atlas_uri

### 5. Add your medical PDF
Place any medical reference PDF inside `healthopedia_backend/data/`.

### 6. Build the FAISS index (run once)
```bash
cd healthopedia_backend
python ingest.py
```

### 7. Start the FastAPI backend
```bash
cd healthopedia_backend
export $(cat .env | xargs)
uvicorn app.main:app --port 8000
```

### 8. Start the Next.js frontend
```bash
npm run dev
```

Open http://localhost:3000

---

## MongoDB Collections

| Collection | Purpose |
|---|---|
| `users` | Created by NextAuth on Google sign-in |
| `prompts` | Community-shared prompts with creator reference |
| `chat_sessions` | Per-user chat sessions with title and timestamp |
| `chat_messages` | Individual messages per session |
