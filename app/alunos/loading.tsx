import { MainLayout } from "@/components/layout/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <MainLayout title="Carregando..." subtitle="Sincronizando diretório de contatos">
      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-6 bg-white/[0.03] border-white/5 h-32 flex flex-col justify-end">
            <Skeleton className="h-8 w-16 mb-2 bg-white/5" />
            <Skeleton className="h-3 w-24 bg-white/5" />
          </div>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
        <Skeleton className="h-12 w-full lg:flex-1 rounded-2xl bg-white/5" />
        <Skeleton className="h-12 w-44 rounded-2xl bg-white/5" />
        <Skeleton className="h-12 w-40 rounded-2xl bg-white/5" />
      </div>

      {/* Table Skeleton */}
      <div className="glass-card overflow-hidden">
        <div className="w-full h-96 bg-white/[0.01]">
            <div className="p-6 border-b border-white/5 flex gap-10">
                <Skeleton className="h-3 w-32 bg-white/5" />
                <Skeleton className="h-3 w-44 bg-white/5" />
                <Skeleton className="h-3 w-32 bg-white/5" />
            </div>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-6 border-b border-white/[0.02] flex items-center gap-10">
                    <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                    <Skeleton className="h-3 w-64 bg-white/5" />
                    <Skeleton className="h-3 w-32 bg-white/5 ml-auto" />
                </div>
            ))}
        </div>
      </div>
    </MainLayout>
  );
}
