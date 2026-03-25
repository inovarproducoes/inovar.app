export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-card border rounded-xl" />
        ))}
      </div>
      <div className="border rounded-lg overflow-hidden bg-card">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-14 border-b bg-muted/20" />
        ))}
      </div>
    </div>
  );
}
