"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // The error is surfaced, never hidden. No measurement or local data is cleared.
    console.error("Quantum Optics Laboratory error boundary:", error);
  }, [error]);

  return (
    <div className="shell flex min-h-[60vh] flex-col justify-center py-16">
      <p className="label mb-3 text-vermilion">Runtime error</p>
      <h1 className="display-lg max-w-2xl">The page could not finish rendering.</h1>
      <p className="mt-3 max-w-lg text-[0.82rem] leading-relaxed text-muted">
        No recorded data has been deleted. You can retry the page, return to the laboratory index, or export your local
        notebook data from the progress page if the problem persists.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="btn">Retry</button>
        <a href="/" className="btn btn-ghost">Laboratory home</a>
        <a href="/progress" className="btn btn-ghost">Export local data</a>
      </div>
      <pre className="mt-6 max-w-xl overflow-x-auto border border-line bg-paper-2 p-3 font-mono text-[0.62rem] text-muted">
        {error.message}
      </pre>
    </div>
  );
}
