import os
import asyncio
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.rag.retriever import get_retriever
from app.rag.memory import (
    get_or_create_session,
    load_chat_history,
    save_messages,
    get_sessions,
    get_session_messages,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load retriever ONCE at startup — not per request
print("Loading FAISS index and embedding model at startup...")
RETRIEVER = get_retriever()
print("Retriever ready.")

PROMPT_TEMPLATE = (
    "You are a helpful medical assistant. Use the following medical reference "
    "context and conversation history to answer the question accurately. "
    "If the answer is not in the context, use your general medical knowledge but mention it.\n\n"
    "Context from medical reference:\n{context}\n\n"
    "Conversation history:\n{history}\n\n"
    "Human: {question}\n\n"
    "Assistant:"
)

class ChatRequest(BaseModel):
    user_id: str
    session_id: str | None = None
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    session_id = get_or_create_session(req.user_id, req.session_id, req.message)
    history = load_chat_history(session_id)

    history_text = ""
    for msg in history.messages:
        role = "Human" if msg.type == "human" else "Assistant"
        history_text += f"{role}: {msg.content}\n"

    docs = RETRIEVER.invoke(req.message)
    context = "\n\n".join([d.page_content for d in docs])

    prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)

    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model_name="llama-3.3-70b-versatile",
        temperature=0.3,
        streaming=True,
    )

    chain = prompt | llm | StrOutputParser()
    collected = []

    async def generate():
        async for chunk in chain.astream({
            "context": context,
            "history": history_text,
            "question": req.message,
        }):
            collected.append(chunk)
            yield chunk
            await asyncio.sleep(0.03)

        full_answer = "".join(collected).strip()
        save_messages(session_id, req.message, full_answer)
        yield f"\n__SESSION_ID__:{session_id}"

    return StreamingResponse(generate(), media_type="text/plain")

@app.get("/sessions/{user_id}")
async def sessions(user_id: str):
    return get_sessions(user_id)

@app.get("/messages/{session_id}")
async def messages(session_id: str):
    return get_session_messages(session_id)

@app.get("/health")
async def health():
    return {"status": "ok"}
