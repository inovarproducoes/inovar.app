export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-9 w-64 bg-muted rounded-md" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-14 bg-card border rounded-xl" />
      ))}
    </div>
  );
}
