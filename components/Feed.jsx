"use client";
import { useState, useEffect } from "react";
import PromptCard from "./PromptCard";

const PromptCardList = ({ data, handleTagClick }) => (
  <div className="mt-16 prompt_layout">
    {data.map((post) => (
      <PromptCard
        key={post._id}
        post={post}
        handleTagClick={handleTagClick}
      />
    ))}
  </div>
);

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  const filterPrompts = (text) => {
    const regex = new RegExp(text, "i");
    return posts.filter(
      (item) =>
        regex.test(item.creator?.username) ||
        regex.test(item.tag) ||
        regex.test(item.prompt)
    );
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setSearchResults(filterPrompts(e.target.value));
  };

  const handleTagClick = (tag) => {
    setSearchText(tag);
    setSearchResults(filterPrompts(tag));
  };

  return (
    <section className="feed">
      <form className="relative w-full flex-center" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search for a tag or a username"
          value={searchText}
          onChange={handleSearchChange}
          required
          className="search_input peer"
        />
      </form>
      <PromptCardList
        data={searchText ? searchResults : posts}
        handleTagClick={handleTagClick}
      />
    </section>
  );
};

export default Feed;
