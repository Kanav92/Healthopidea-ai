"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Profile from "@components/Profile";

const UserProfile = ({ params }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`/api/prompts/${params.id}`);
      const data = await res.json();
      setPosts(data);
    };
    if (params.id) fetchPosts();
  }, [params.id]);

  const handleEdit = (post) => router.push(`/update-prompt?id=${post._id}`);

  const handleDelete = async (post) => {
    const confirmed = confirm("Are you sure you want to delete this prompt?");
    if (!confirmed) return;
    await fetch(`/api/prompts/${post._id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p._id !== post._id));
  };

  const isOwner = session?.user.id === params.id;

  return (
    <Profile
      name={isOwner ? "My" : "User"}
      desc={isOwner ? "Welcome to your profile" : "Community prompts"}
      data={posts}
      handleEdit={isOwner ? handleEdit : undefined}
      handleDelete={isOwner ? handleDelete : undefined}
    />
  );
};

export default UserProfile;
