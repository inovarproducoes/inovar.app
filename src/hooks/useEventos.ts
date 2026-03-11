import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventosService } from '@/services/eventosService';

export function useEventos(dias?: number) {
  return useQuery({
    queryKey: ['eventos', dias],
    queryFn: () => eventosService.getEventos(dias),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}

export function useEvento(id: string) {
  return useQuery({
    queryKey: ['evento', id],
    queryFn: () => eventosService.getEventoById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}

export function useDeleteEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventosService.deleteEvento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    }
  });
}

export function useUpdateEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => eventosService.updateEvento(data.id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento', data.id] });
    }
  });
}

export function useEventosStats() {
  return useQuery({
    queryKey: ['eventos-stats'],
    queryFn: async () => {
      const res = await fetch('/api/eventos/stats');
      if (!res.ok) throw new Error("Erro ao buscar estatísticas");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: {
      total: 0, proximos: 0, vagasOcupadas: 0, taxaOcupacao: 0,
      tendencias: { total: 0, vagas: 0, taxa: 0 },
      eventosPorMes: [],
      distribuicaoPorTipo: []
    }
  });
}

export function useCreateEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventosService.createEvento,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventos'] })
  });
}
