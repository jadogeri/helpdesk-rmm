"use client"; // 💡 Enforces client-side runtime behavior

export const dynamic = "force-dynamic"; 

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: "3rem", fontFamily: "sans-serif", textAlign: "center" }}>
        <h2>A critical system error occurred</h2>
        <p style={{ color: "#ef4444" }}>{error?.message || "Root boundary runtime exception caught."}</p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Reset Application
        </button>
      </body>
    </html>
  );
}
