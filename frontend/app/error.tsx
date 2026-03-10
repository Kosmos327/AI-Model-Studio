"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 p-8">
      <h2 className="text-xl font-semibold text-red-400">Something went wrong</h2>
      <p className="text-sm text-gray-400 text-center max-w-md">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
