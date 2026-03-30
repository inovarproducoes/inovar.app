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

const STATS_INITIAL_DATA: OsStats = {
  total: 0,
  abertas: 0,
  emAndamento: 0,
  finalizadas: 0,
  taxaFinalizacao: 0,
  tendencias: { total: 0, abertas: 0, finalizadas: 0, taxa: 0 },
  osPorMes: [],
  recentes: [],
};

export function useOsStats() {
  return useQuery<OsStats>({
    queryKey: ['os-stats'],
    queryFn: async () => {
      const res = await fetch('/api/os/stats');
      if (!res.ok) throw new Error("Erro ao buscar estatísticas de OS");
      return res.json();
    },
    initialData: STATS_INITIAL_DATA,
  });
}
