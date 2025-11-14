'use client';

import { useEffect, useRef } from "react";

type Props = {
  postId: number;
};

export function PostViewTracker({ postId }: Props) {
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
