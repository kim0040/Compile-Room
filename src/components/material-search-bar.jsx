'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function MaterialSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialKeyword = searchParams.get("keyword") ?? "";
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (keyword) {
      params.set("keyword", keyword);
    } else {
      params.delete("keyword");
    }
    const query = params.toString();
    router.push(query ? `/materials?${query}` : "/materials");
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full text-text-secondary-light"
    >
      <input
        type="text"
        name="keyword"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="강의명, 과제명, 주제 등으로 검색"
        className="w-full rounded-xl border border-transparent bg-background-light px-12 py-3 text-base text-text-primary-light shadow-inner shadow-black/5 outline-none ring-primary/0 transition placeholder:text-text-secondary-light focus:border-primary/50 focus:ring-2 focus:ring-primary/50"
      />
      <button
        type="submit"
        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light transition hover:text-primary"
        aria-label="자료 검색"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </button>
      {keyword && (
        <button
          type="button"
          onClick={() => {
            setKeyword("");
            const params = new URLSearchParams(searchParams.toString());
            params.delete("keyword");
            const query = params.toString();
            router.push(query ? `/materials?${query}` : "/materials");
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary-light transition hover:text-primary"
          aria-label="검색어 지우기"
        >
          ✕
        </button>
      )}
    </form>
  );
}
