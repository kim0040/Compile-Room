'use client';

import { useEffect, useRef } from "react";

export function PostViewTracker({ postId }) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    fetch(`/api/posts/${postId}/view`, {
      method: "POST",
    }).catch(() => {
      trackedRef.current = false;
    });
  }, [postId]);

  return null;
}
