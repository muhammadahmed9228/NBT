function SkeletonBlock({ className = "" }) {
  return <div className={`animate-pulse rounded bg-neutral-200 ${className}`} />;
}

export default function HomePageSkeleton() {
  return (
    <div className="space-y-8 pb-16 md:space-y-10" aria-label="Loading homepage" role="status">
      <SkeletonBlock className="-mx-6 h-[52vh] w-[calc(100%+3rem)] md:mx-0 md:h-[60vh] md:w-full md:rounded-lg" />

      {["first", "second"].map((section) => (
        <section key={section} className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <SkeletonBlock className="mb-3 h-8 w-52 md:h-10" />
          <SkeletonBlock className="mb-6 h-4 w-72 max-w-full md:mb-10" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {["one", "two", "three", "four"].map((card) => (
              <div key={card}>
                <SkeletonBlock className="aspect-[3/4] w-full" />
                <SkeletonBlock className="mt-3 h-4 w-3/4" />
                <SkeletonBlock className="mt-2 h-4 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      ))}
      <span className="sr-only">Loading homepage content...</span>
    </div>
  );
}
