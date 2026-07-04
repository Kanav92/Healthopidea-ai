"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Form from "@components/Form";

const UpdatePrompt = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptId = searchParams.get("id");

  const [submitting, setSubmitting] = useState(false);
  const [post, setPost] = useState({ prompt: "", tag: "" });

  useEffect(() => {
    const fetchPrompt = async () => {
      if (!promptId) return;
      const res = await fetch(`/api/prompts/${promptId}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPost({ prompt: data[0].prompt, tag: data[0].tag });
      }
    };
    fetchPrompt();
  }, [promptId]);

  const updatePrompt = async (e) => {
    e.preventDefault();
    if (!promptId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/prompts/${promptId}`, {
        method: "PATCH",
        body: JSON.stringify({ prompt: post.prompt, tag: post.tag }),
      });
      if (res.ok) router.push("/");
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      type="Edit"
      post={post}
      setPost={setPost}
      submitting={submitting}
      handleSubmit={updatePrompt}
    />
  );
};

export default UpdatePrompt;
