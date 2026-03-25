export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-card border rounded-xl" />
        ))}
      </div>
      <div className="h-72 bg-card border rounded-xl" />
    </div>
  );
}
