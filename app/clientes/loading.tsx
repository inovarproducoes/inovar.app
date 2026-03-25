export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-card border rounded-xl" />
        ))}
      </div>
      <div className="flex gap-3">
        <div className="h-9 flex-1 max-w-md bg-muted rounded-md" />
        <div className="h-9 w-40 bg-muted rounded-md" />
        <div className="h-9 w-32 bg-muted rounded-md ml-auto" />
      </div>
      <div className="border rounded-lg overflow-hidden bg-card">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 border-b bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
