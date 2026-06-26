export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header Skeleton */}
      <div className="h-16 bg-white border-b border-gray-200" />

      {/* Article Content Skeleton */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title */}
        <div className="mb-6">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Hero Image */}
        <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-8 animate-pulse" />

        {/* Content Lines */}
        <div className="space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-200 rounded animate-pulse"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>
      </article>
    </div>
  );
}
