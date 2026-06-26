export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Hero Skeleton */}
      <div className="relative h-[60vh] bg-gray-200 animate-pulse" />

      {/* Room Navigator Skeleton */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-8 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Content Cards Skeleton */}
      <section className="py-12 sm:py-16 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 rounded-lg w-64 mb-8 animate-pulse" />
          <div className="flex gap-2 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4">
                <div
                  className="bg-white rounded-xl overflow-hidden border border-gray-100"
                  style={{ height: `${200 + (i % 3) * 80}px` }}
                >
                  <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
