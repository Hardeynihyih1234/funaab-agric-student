import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-funaab-soft/80", className)}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-line bg-white p-5">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-3 h-6 w-3/4" />
      <Skeleton className="mt-4 h-16 w-full" />
    </div>
  );
}
