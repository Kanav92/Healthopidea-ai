import connectDB from "@lib/mongodb";
import Prompt from "@models/Prompt";

export const GET = async () => {
  try {
    await connectDB();
    const prompts = await Prompt.find({}).populate("creator");
    return new Response(JSON.stringify(prompts), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch prompts", { status: 500 });
  }
};

export const POST = async (req) => {
  const { userId, prompt, tag } = await req.json();
  try {
    await connectDB();
    const newPrompt = new Prompt({ creator: userId, prompt, tag });
    await newPrompt.save();
    return new Response(JSON.stringify(newPrompt), { status: 201 });
  } catch (error) {
    return new Response("Failed to create prompt", { status: 500 });
  }
};
