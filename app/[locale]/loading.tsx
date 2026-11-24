export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12" aria-busy="true">
      <div className="mb-8 h-9 w-48 animate-pulse rounded-md bg-gray-800/70" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/60">
            <div className="aspect-square w-full animate-pulse bg-gray-800/60" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-800/70" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-800/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
