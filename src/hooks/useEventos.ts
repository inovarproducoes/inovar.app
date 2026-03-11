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
  
  if (!eventos) return { 
    total: 0, proximos: 0, vagasOcupadas: 0, taxaOcupacao: 0,
    tendencias: { total: 0, vagas: 0, taxa: 0 },
    eventosPorMes: [],
    distribuicaoPorTipo: []
  };
  
  const proximos = eventos.filter((e: any) => new Date(e.data_inicio) >= new Date() && e.status !== "cancelado").length;
  const vagasOcupadas = eventos.reduce((sum: number, e: any) => sum + (e.capacidade_maxima - e.vagas_disponiveis), 0);
  const totalCapacidade = eventos.reduce((sum: number, e: any) => sum + e.capacidade_maxima, 0);
  const taxaOcupacao = totalCapacidade ? Math.round((vagasOcupadas / totalCapacidade) * 100) : 0;
  
  // Data for Eventos Por Mes (mocking the structure for 12 months)
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const eventosPorMesMap = new Array(12).fill(0);
  
  // Data for Distribuição Por Tipo
  const distribuicaoMap: Record<string, number> = {};
  
  eventos.forEach((e: any) => {
    // Mes
    const data = new Date(e.data_inicio);
    if (!isNaN(data.getTime())) {
      eventosPorMesMap[data.getMonth()]++;
    }
    
    // Tipo
    if (e.tipo_evento) {
      distribuicaoMap[e.tipo_evento] = (distribuicaoMap[e.tipo_evento] || 0) + 1;
    }
  });
  
  const eventosPorMes = eventosPorMesMap.map((total, idx) => ({
    name: monthNames[idx],
    total
  }));
  
  // Create default fallback if no events or very few
  const maxEvents = Math.max(...eventosPorMesMap, 1);
  const eventosPorMesFormatado = eventosPorMes.map(m => ({
    ...m,
    height: Math.max((m.total / maxEvents) * 160, 20) // min 20px
  }));

  // Distribuicao Formatada (percentage)
  const totalEventosTipos = Object.values(distribuicaoMap).reduce((a, b) => a + b, 0);
  const distribuicaoPorTipo = Object.entries(distribuicaoMap)
    .sort((a, b) => b[1] - a[1]) // Sort by highest
    .map(([tipo, count]) => ({
      tipo,
      percentual: totalEventosTipos ? Math.round((count / totalEventosTipos) * 100) : 0,
      count
    }));

  return { 
    total: eventos.length, 
    proximos, 
    vagasOcupadas, 
    taxaOcupacao,
    tendencias: { 
      total: 12, // Mock trends based on HTML
      vagas: 8,
      taxa: 5
    },
    eventosPorMes: eventosPorMesFormatado,
    distribuicaoPorTipo
  };
}

export function useCreateEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eventosService.createEvento,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['eventos'] })
  });
}
