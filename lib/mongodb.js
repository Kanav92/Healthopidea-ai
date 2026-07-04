import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "healthopedia",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    throw error;
  }
};

export default connectDB;
