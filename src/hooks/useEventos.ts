import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventosService } from '@/services/eventosService';
import { Evento } from '@/types/database';
import { toast } from 'sonner';

export function useEventos(dias?: number) {
  return useQuery<Evento[]>({
    queryKey: ['eventos', dias],
    queryFn: () => eventosService.getEventos(dias),
  });
}

export function useEvento(id: string) {
  return useQuery<Evento>({
    queryKey: ['evento', id],
    queryFn: () => eventosService.getEventoById(id),
    enabled: !!id,
  });
}

export function useDeleteEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventosService.deleteEvento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos-stats'] });
      toast.success("Evento excluído com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao excluir evento. Tente novamente.");
    },
  });
}

export function useUpdateEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Evento> & { id: string }) =>
      eventosService.updateEvento(data.id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento', data.id] });
      queryClient.invalidateQueries({ queryKey: ['eventos-stats'] });
      toast.success("Evento atualizado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao atualizar evento. Tente novamente.");
    },
  });
}

interface EventosStats {
  total: number;
  proximos: number;
  vagasOcupadas: number;
  taxaOcupacao: number;
  tendencias: { total: number; vagas: number; taxa: number };
  eventosPorMes: { name: string; total: number; height: number }[];
  distribuicaoPorTipo: { tipo: string; percentual: number; count: number }[];
  proximosEventos: Evento[];
  recentes: Evento[];
}

const STATS_INITIAL_DATA: EventosStats = {
  total: 0,
  proximos: 0,
  vagasOcupadas: 0,
  taxaOcupacao: 0,
  tendencias: { total: 0, vagas: 0, taxa: 0 },
  eventosPorMes: [],
  distribuicaoPorTipo: [],
  proximosEventos: [],
  recentes: [],
};

export function useEventosStats() {
  return useQuery<EventosStats>({
    queryKey: ['eventos-stats'],
    queryFn: async () => {
      const res = await fetch('/api/eventos/stats');
      if (!res.ok) throw new Error("Erro ao buscar estatísticas");
      return res.json();
    },
    initialData: STATS_INITIAL_DATA,
  });
}

export function useCreateEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventosService.createEvento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos-stats'] });
      toast.success("Evento criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar evento. Verifique os dados e tente novamente.");
    },
  });
}
