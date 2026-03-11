import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alunosService } from '@/services/alunosService';

export function useAlunos(filtros?: any) {
  return useQuery({
    queryKey: ['alunos', filtros],
    queryFn: () => alunosService.buscarAlunos(filtros),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}

export function useVincularAlunoEvento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alunosService.vincularAlunoEvento,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['evento-alunos', variables.evento_id] });
    }
  });
}

export function useAlunosDoEvento(evId: string) {
  return useQuery({
    queryKey: ['evento-alunos', evId],
    queryFn: () => alunosService.buscarAlunosDoEvento(evId),
    enabled: !!evId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
