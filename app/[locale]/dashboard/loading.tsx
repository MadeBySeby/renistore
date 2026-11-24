export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="h-8 w-40 animate-pulse rounded-md bg-gray-800/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-gray-800 bg-gray-900/60" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-gray-800 bg-gray-900/60" />
    </div>
  );
}
