import mongoose from "mongoose";

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, default: "New Chat" },
}, { timestamps: true });

const ChatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  role: { type: String, enum: ["human", "ai"], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const ChatSession = mongoose.models.ChatSession || mongoose.model("ChatSession", ChatSessionSchema);
export const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);
