"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

const Nav = () => {
  const { data: session } = useSession();
  const [toggleDropdown, setToggleDropdown] = useState(false);

  return (
    <nav className="flex-between w-full mb-16 pt-3">
      <Link href="/" className="flex gap-2 flex-center">
        <span className="logo_text text-2xl font-bold orange_gradient">Healthopedia AI</span>
      </Link>

      {/* Desktop Nav */}
      <div className="sm:flex hidden gap-3 md:gap-5">
        {session?.user ? (
          <>
            <Link href="/create-prompt" className="btn">Create Prompt</Link>
            <Link href="/chat" className="btn_outline">AI Chat</Link>
            <button onClick={() => signOut()} className="outline_btn">Sign Out</button>
            <Link href={`/profile/${session.user.id}`}>
              <Image
                src={session.user.image}
                width={37}
                height={37}
                className="rounded-full"
                alt="Profile"
              />
            </Link>
          </>
        ) : (
          <button onClick={() => signIn("google")} className="btn">Sign In</button>
        )}
      </div>

      {/* Mobile Nav */}
      <div className="sm:hidden flex relative">
        {session?.user ? (
          <div className="flex">
            <Image
              src={session.user.image}
              width={37}
              height={37}
              className="rounded-full cursor-pointer"
              alt="Profile"
              onClick={() => setToggleDropdown(!toggleDropdown)}
            />
            {toggleDropdown && (
              <div className="dropdown">
                <Link href={`/profile/${session.user.id}`} className="dropdown_link" onClick={() => setToggleDropdown(false)}>My Profile</Link>
                <Link href="/create-prompt" className="dropdown_link" onClick={() => setToggleDropdown(false)}>Create Prompt</Link>
                <Link href="/chat" className="dropdown_link" onClick={() => setToggleDropdown(false)}>AI Chat</Link>
                <button onClick={() => { setToggleDropdown(false); signOut(); }} className="mt-5 w-full btn">Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => signIn("google")} className="btn">Sign In</button>
        )}
      </div>
    </nav>
  );
};

export default Nav;
