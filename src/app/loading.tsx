export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-foreground-muted text-sm">正在加载...</p>
    </div>
  );
}
