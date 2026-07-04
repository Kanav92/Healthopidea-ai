import connectDB from "@lib/mongodb";
import Prompt from "@models/Prompt";

export const GET = async (req, { params }) => {
  try {
    await connectDB();
    // Check if this is a MongoDB ObjectId (prompt fetch) or user id (profile fetch)
    const mongoose = await import("mongoose");
    const isObjectId = mongoose.default.Types.ObjectId.isValid(params.id);

    if (isObjectId) {
      // Try fetching as a single prompt first
      const prompt = await Prompt.findById(params.id).populate("creator");
      if (prompt) return new Response(JSON.stringify([prompt]), { status: 200 });
    }

    // Fallback: fetch all prompts by creator
    const prompts = await Prompt.find({ creator: params.id }).populate("creator");
    return new Response(JSON.stringify(prompts), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch prompts", { status: 500 });
  }
};

export const PATCH = async (req, { params }) => {
  const { prompt, tag } = await req.json();
  try {
    await connectDB();
    const existing = await Prompt.findById(params.id);
    if (!existing) return new Response("Prompt not found", { status: 404 });
    existing.prompt = prompt;
    existing.tag = tag;
    await existing.save();
    return new Response(JSON.stringify(existing), { status: 200 });
  } catch (error) {
    return new Response("Failed to update prompt", { status: 500 });
  }
};

export const DELETE = async (req, { params }) => {
  try {
    await connectDB();
    await Prompt.findByIdAndDelete(params.id);
    return new Response("Prompt deleted", { status: 200 });
  } catch (error) {
    return new Response("Failed to delete prompt", { status: 500 });
  }
};
