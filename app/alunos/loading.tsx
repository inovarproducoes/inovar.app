export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-card border rounded-xl" />
        ))}
      </div>
      <div className="flex gap-3">
        <div className="h-9 flex-1 bg-muted rounded-md" />
        <div className="h-9 w-36 bg-muted rounded-md" />
        <div className="h-9 w-36 bg-muted rounded-md" />
      </div>
      <div className="border rounded-lg overflow-hidden bg-card">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-14 border-b bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
