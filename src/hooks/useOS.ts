import { useQuery } from '@tanstack/react-query';
import { OS } from '@prisma/client';

export interface OsStats {
  total: number;
  abertas: number;
  emAndamento: number;
  finalizadas: number;
  taxaFinalizacao: number;
  tendencias: { total: number; abertas: number; finalizadas: number; taxa: number };
  osPorMes: { name: string; ordens: number; height: number }[];
  recentes: OS[];
}

export function useOsStats() {
  return useQuery<OsStats>({
    queryKey: ['os-stats'],
    queryFn: async () => {
      const res = await fetch('/api/os/stats');
      if (!res.ok) throw new Error("Erro ao buscar estatísticas de OS");
      return res.json();
    },
    staleTime: 5000, // 5 segundos de cache apenas
    refetchOnWindowFocus: true
  });
}
