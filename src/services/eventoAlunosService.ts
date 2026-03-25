import { eventosService } from "./eventosService";
import { alunosService } from "./alunosService";
import { formatarCPF } from "@/lib/cpfUtils";
import { Evento } from "@/types/database";
import { AlunoFormData } from "@/types/alunos";

export const eventoAlunosService = {
  criarEventoComAlunos: async (eventoData: Partial<Evento>, alunos: Partial<AlunoFormData>[]) => {
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
        const existenteMat = aluno.matricula
          ? await alunosService.buscarAlunoPorMatricula(aluno.matricula)
          : null;
        if (existenteMat) {
           alunoId = existenteMat.id;
           alunosExistentes++;
        }
      } catch {
        // Aluno não encontrado por matrícula — será criado a seguir
      }

      // Se não, tenta criar
      if (!alunoId) {
         try {
           const criado = await alunosService.criarAluno({
             ...aluno,
             cpf_responsavel: formatarCPF(aluno.cpf_responsavel || '')
           });
           alunoId = criado.id;
           alunosCriados++;
         } catch {
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
         } catch {
           // Ignora erro se já vinculado
         }
      }
    }

    return { evento, alunosCriados, alunosExistentes, relacionamentosCriados };
  }
};
