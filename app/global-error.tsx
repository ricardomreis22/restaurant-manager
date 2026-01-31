"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ padding: "2rem", fontFamily: "sans-serif", background: "#1a1a1a", color: "#fff" }}>
        <h2>Something went wrong</h2>
        <p style={{ color: "#f87171", margin: "1rem 0" }}>{error.message}</p>
        <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
          Check the browser console (F12) for details.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
