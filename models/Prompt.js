import mongoose from "mongoose";

const PromptSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  prompt: { type: String, required: true },
  tag: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Prompt || mongoose.model("Prompt", PromptSchema);
