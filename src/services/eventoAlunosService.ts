import { eventosService } from "./eventosService";
import { alunosService } from "./alunosService";
import { formatarCPF } from "@/lib/cpfUtils";

export const eventoAlunosService = {
  criarEventoComAlunos: async (eventoData: any, alunos: any[]) => {
    // 1. Criar Evento
    const evento = await eventosService.createEvento(eventoData);
    
    let alunosCriados = 0;
    let alunosExistentes = 0;
    let relacionamentosCriados = 0;

    // 2 e 3. Processar alunos
    for (const aluno of alunos) {
      let alunoId = null;
      
      // Existe por matricula?
      try {
        const existenteMat = await alunosService.buscarAlunoPorMatricula(aluno.matricula);
        if (existenteMat) {
           alunoId = existenteMat.id;
           alunosExistentes++;
        }
      } catch (e) {}

      // Se não, tenta criar
      if (!alunoId) {
         try {
           const criado = await alunosService.criarAluno({
             ...aluno,
             cpf_responsavel: formatarCPF(aluno.cpf_responsavel || '')
           });
           alunoId = criado.id;
           alunosCriados++;
         } catch (e: any) {
           // Em caso de erro (email/matricula ja existe fallback)
           alunoId = null;
         }
      }

      // Vincular
      if (alunoId) {
         try {
            await alunosService.vincularAlunoEvento({ 
              evento_id: evento.id, 
              aluno_id: alunoId,
              status_participacao: 'confirmado',
              acompanhantes: 0,
              confirma_presenca: false
            });
            relacionamentosCriados++;
         } catch (e) {
           // Ignora erro se já vinculado
         }
      }
    }

    return { evento, alunosCriados, alunosExistentes, relacionamentosCriados };
  }
};
