export default function StudentLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-48 animate-pulse rounded-[2rem] bg-white" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-32 animate-pulse rounded-3xl bg-white" />
        <div className="h-32 animate-pulse rounded-3xl bg-white" />
        <div className="h-32 animate-pulse rounded-3xl bg-white" />
        <div className="h-32 animate-pulse rounded-3xl bg-white" />
      </div>
    </div>
  );
}
