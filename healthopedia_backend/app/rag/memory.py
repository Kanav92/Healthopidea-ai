import os
from dotenv import load_dotenv

# Load from healthopedia_backend/.env regardless of working directory
load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(".env")  # fallback if running from healthopedia_backend/

from datetime import datetime
from pymongo import MongoClient
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.messages import HumanMessage, AIMessage

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI not found in environment")

client = MongoClient(MONGODB_URI)
db = client["healthopedia"]
messages_col = db["chat_messages"]
sessions_col = db["chat_sessions"]

def get_or_create_session(user_id: str, session_id: str | None, first_message: str) -> str:
    if session_id:
        session = sessions_col.find_one({"_id": session_id, "user_id": user_id})
        if session:
            return session_id
    from bson import ObjectId
    new_id = str(ObjectId())
    sessions_col.insert_one({
        "_id": new_id,
        "user_id": user_id,
        "title": first_message[:60],
        "created_at": datetime.utcnow(),
    })
    return new_id

def load_chat_history(session_id: str) -> ChatMessageHistory:
    history = ChatMessageHistory()
    past = messages_col.find({"session_id": session_id}).sort("created_at", 1)
    for msg in past:
        if msg["role"] == "human":
            history.add_message(HumanMessage(content=msg["content"]))
        else:
            history.add_message(AIMessage(content=msg["content"]))
    return history

def save_messages(session_id: str, human: str, ai: str):
    now = datetime.utcnow()
    messages_col.insert_many([
        {"session_id": session_id, "role": "human", "content": human, "created_at": now},
        {"session_id": session_id, "role": "ai", "content": ai, "created_at": now},
    ])

def get_sessions(user_id: str) -> list:
    result = sessions_col.find({"user_id": user_id}).sort("created_at", -1)
    return [
        {
            "session_id": str(s["_id"]),
            "title": s.get("title", "Untitled"),
            "created_at": s["created_at"].isoformat(),
        }
        for s in result
    ]

def get_session_messages(session_id: str) -> list:
    msgs = messages_col.find({"session_id": session_id}).sort("created_at", 1)
    return [{"role": m["role"], "content": m["content"]} for m in msgs]
