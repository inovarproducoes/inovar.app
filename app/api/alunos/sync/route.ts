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
        update: {
          ...alunoData,
          updated_at: new Date()
        },
        create: {
          ...alunoData,
          matricula: alunoData.matricula || `MAT-${Date.now()}`, // Fallback se não enviado
        }
      });
    } else {
      return NextResponse.json({ error: "CPF ou ID do aluno é obrigatório para sincronização." }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      aluno_id: aluno.id,
      message: "Sincronização de Aluno concluída com sucesso." 
    }, { status: 200 });

  } catch (error) {
    console.error("Erro na sincronização n8n:", error);
    return NextResponse.json({ 
      error: "Erro na sincronização", 
      detalhes: error instanceof Error ? error.message : "Desconhecido" 
    }, { status: 500 });
  }
}
