"use client";
import { useSession, signIn } from "next-auth/react";
import Chat from "@components/Chat";

const ChatPage = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div style={{ textAlign: "center", marginTop: "5rem" }}>
        <h2 className="head_text">Sign in to use AI Chat</h2>
        <p className="desc" style={{ marginBottom: "2rem" }}>
          You need to be signed in to access the medical AI assistant.
        </p>
        <button onClick={() => signIn("google")} className="btn">
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <section style={{ width: "100%" }}>
      <h1 className="head_text" style={{ marginBottom: "1.5rem" }}>
        <span className="blue_gradient">Medical AI Assistant</span>
      </h1>
      <Chat />
    </section>
  );
};

export default ChatPage;
