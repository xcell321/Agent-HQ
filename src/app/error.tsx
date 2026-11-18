"use client";

// Honest error state: say what happened, offer a retry, invent nothing.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="max-w-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Agent HQ</p>
        <h1 className="mt-4 text-xl font-bold">Something went wrong loading your office</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Your data is safe — this is a display problem, not a data problem.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
