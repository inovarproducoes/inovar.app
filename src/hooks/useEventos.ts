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
  const { data: eventos } = useEventos();
  
  if (!eventos) return { total: 0, proximos: 0, vagasOcupadas: 0, taxaOcupacao: 0 };
  
  const proximos = eventos.filter((e: any) => new Date(e.data_inicio) >= new Date() && e.status !== "cancelado").length;
  const vagasOcupadas = eventos.reduce((sum: number, e: any) => sum + (e.capacidade_maxima - e.vagas_disponiveis), 0);
  const totalCapacidade = eventos.reduce((sum: number, e: any) => sum + e.capacidade_maxima, 0);
  const taxaOcupacao = totalCapacidade ? Math.round((vagasOcupadas / totalCapacidade) * 100) : 0;
  
  return { total: eventos.length, proximos, vagasOcupadas, taxaOcupacao };
}

export function useCreateEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventosService.createEvento,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventos'] })
  });
}
