import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { 
      evento_nome, 
      evento_instituicao, 
      evento_data, 
      ...alunoData 
    } = data;

    // 1. Upsert Aluno (pelo CPF como chave de identificação principal para o n8n)
    let aluno;
    if (alunoData.cpf) {
      aluno = await prisma.aluno.upsert({
        where: { cpf: alunoData.cpf },
        update: {
          ...alunoData,
          updated_at: new Date()
        },
        create: {
          ...alunoData,
          matricula: alunoData.matricula || `MAT-${Date.now()}`, // Fallback se não enviado
        }
      });
    } else if (alunoData.id) {
       aluno = await prisma.aluno.upsert({
        where: { id: alunoData.id },
        update: alunoData,
        create: alunoData
      });
    } else {
      return NextResponse.json({ error: "CPF ou ID do aluno é obrigatório para sincronização." }, { status: 400 });
    }

    // 2. Se houver dados de evento, processar a vinculação
    if (evento_nome) {
      const instituicao = evento_instituicao || alunoData.instituicao || "Instituição não informada";
      const dataEvento = evento_data || "2026-12-31"; // Fallback data

      // Upsert Evento (por Nome + Instituição para evitar duplicados)
      const evento = await prisma.evento.upsert({
        where: {
          nome_instituicao: {
            nome: evento_nome,
            instituicao: instituicao
          }
        },
        update: {
          data_inicio: dataEvento
        },
        create: {
          nome: evento_nome,
          instituicao: instituicao,
          data_inicio: dataEvento,
          data_fim: dataEvento,
          horario_inicio: "19:00",
          horario_fim: "23:00",
          local_nome: "Local a confirmar",
          endereco_completo: "Endereço a confirmar",
          cidade: alunoData.cidade || "Cidade a confirmar",
          estado: "MS",
          capacidade_maxima: 1000,
          vagas_disponiveis: 1000,
          tipo_evento: "formatura",
          status: "planejamento"
        }
      });

      // 3. Vincular Aluno ao Evento (EventoAluno)
      await prisma.eventoAluno.upsert({
        where: {
          evento_id_aluno_id: {
            evento_id: evento.id,
            aluno_id: aluno.id
          }
        },
        update: {}, // Não muda nada se já existir
        create: {
          evento_id: evento.id,
          aluno_id: aluno.id,
          status_participacao: "confirmado"
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      aluno_id: aluno.id,
      message: "Sincronização concluída com sucesso." 
    }, { status: 200 });

  } catch (error) {
    console.error("Erro na sincronização n8n:", error);
    return NextResponse.json({ 
      error: "Erro na sincronização", 
      detalhes: error instanceof Error ? error.message : "Desconhecido" 
    }, { status: 500 });
  }
}
