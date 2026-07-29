export default function ChapterLoading() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-10 bg-background-soft rounded" />
        <div className="h-4 w-2 bg-background-soft rounded" />
        <div className="h-4 w-24 bg-background-soft rounded" />
      </div>

      {/* Title skeleton */}
      <div className="h-10 w-3/4 bg-background-soft rounded mb-2" />
      <div className="h-4 w-48 bg-background-soft rounded mb-8" />

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-full bg-background-soft rounded" />
        <div className="h-4 w-full bg-background-soft rounded" />
        <div className="h-4 w-5/6 bg-background-soft rounded" />
        <div className="h-32 w-full bg-background-soft rounded mt-6" />
        <div className="h-4 w-full bg-background-soft rounded" />
        <div className="h-4 w-4/5 bg-background-soft rounded" />
      </div>
    </div>
  );
}
