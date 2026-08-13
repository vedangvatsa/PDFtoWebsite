"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground mb-2">Something went wrong</p>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Failed to load jobs</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {error?.message || 'We ran into an issue loading the jobs board. Please try again.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
