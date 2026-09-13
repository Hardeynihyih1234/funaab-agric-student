"use client";

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-[1.6rem] border border-line bg-white p-6">
      <h1 className="text-lg font-semibold">This page could not be loaded</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Something went wrong while loading your academic resources. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-funaab px-5 text-sm font-semibold text-white"
      >
        Try again
      </button>
      {error.digest ? (
        <p className="sr-only">Error digest {error.digest}</p>
      ) : null}
    </div>
  );
}
