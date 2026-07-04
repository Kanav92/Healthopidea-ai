"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const Chat = () => {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (session?.user?.id) fetchSessions();
  }, [session]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/sessions/${session.user.id}`
      );
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setSessions([]);
    }
  };

  const loadSession = async (sessionId) => {
    setActiveSession(sessionId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/messages/${sessionId}`
      );
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    setStreamingText("");

    setMessages((prev) => [...prev, { role: "human", content: userMessage }]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session.user.id,
          session_id: activeSession,
          message: userMessage,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let newSessionId = activeSession;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("__SESSION_ID__:")) {
            newSessionId = line.replace("__SESSION_ID__:", "").trim();
          } else {
            fullText += line;
            setStreamingText(fullText);
          }
        }
      }

      setMessages((prev) => [...prev, { role: "ai", content: fullText.trim() }]);
      setStreamingText("");
      setActiveSession(newSessionId);

      if (!activeSession) {
        fetchSessions();
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveSession(null);
    setMessages([]);
    setStreamingText("");
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "80vh", gap: "1rem" }}>
      {/* Sidebar */}
      <div style={{
        width: "240px", flexShrink: 0, background: "#f9fafb",
        borderRadius: "0.75rem", padding: "1rem", overflowY: "auto",
        border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "0.5rem"
      }}>
        <button onClick={startNewChat} className="btn" style={{ width: "100%", marginBottom: "0.5rem" }}>
          + New Chat
        </button>
        {sessions.map((s) => (
          <div
            key={s.session_id}
            onClick={() => loadSession(s.session_id)}
            style={{
              padding: "0.5rem 0.75rem", borderRadius: "0.5rem", cursor: "pointer",
              background: activeSession === s.session_id ? "#e5e7eb" : "transparent",
              fontSize: "0.8rem", color: "#374151", overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {s.title}
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        border: "1px solid #e5e7eb", borderRadius: "0.75rem", overflow: "hidden"
      }}>
        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "1.5rem",
          display: "flex", flexDirection: "column", gap: "1rem"
        }}>
          {messages.length === 0 && !streamingText && (
            <div style={{ textAlign: "center", color: "#9ca3af", marginTop: "4rem" }}>
              <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>Healthopedia AI</p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                Ask me anything about health and medicine.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "human" ? "flex-end" : "flex-start"
            }}>
              <div style={{
                maxWidth: "70%", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                background: msg.role === "human" ? "#111827" : "#f3f4f6",
                color: msg.role === "human" ? "white" : "#111827",
                fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {streamingText && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                maxWidth: "70%", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                background: "#f3f4f6", color: "#111827",
                fontSize: "0.875rem", lineHeight: 1.6, whiteSpace: "pre-wrap",
              }}>
                {streamingText}
                <span style={{ opacity: 0.5, animation: "pulse 1s infinite" }}>▌</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "1rem", borderTop: "1px solid #e5e7eb",
          display: "flex", gap: "0.5rem", background: "white"
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask a medical question..."
            disabled={loading}
            style={{
              flex: 1, padding: "0.625rem 1rem", borderRadius: "9999px",
              border: "1px solid #d1d5db", fontSize: "0.875rem", outline: "none"
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="btn"
            style={{ borderRadius: "9999px", padding: "0.625rem 1.5rem", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
