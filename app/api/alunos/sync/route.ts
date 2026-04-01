import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Sanitizar campos de texto que podem ter caracteres indesejados da automação
    const alunoData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v.replace(/[\n\r\t]/g, ' ').trim() : v])
    );

    // Validar se um id externo é um UUID válido; caso contrário, deixar o Prisma gerar um
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (alunoData.id && !UUID_REGEX.test(alunoData.id)) {
      delete alunoData.id; // Deixar @default(uuid()) gerar o ID
    }

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
