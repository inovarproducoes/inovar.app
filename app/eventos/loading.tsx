export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-40 bg-muted rounded-md" />
        <div className="h-9 w-32 bg-muted rounded-md" />
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-64 bg-muted rounded-md" />
        <div className="h-9 w-36 bg-muted rounded-md" />
        <div className="h-9 w-36 bg-muted rounded-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="h-32 bg-card border rounded-xl" />
        ))}
      </div>
    </div>
  );
}
