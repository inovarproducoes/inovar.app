import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitize(v: unknown): unknown {
  return typeof v === 'string' ? v.replace(/[\n\r\t]/g, ' ').trim() : v;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Sanitizar campos string e validar ID
    const rawId = sanitize(data.id) as string | undefined;
    const cpf = sanitize(data.cpf) as string | undefined;

    // Se o id externo não for UUID válido, remover para que o Prisma gere um
    const idValido = rawId && UUID_REGEX.test(rawId) ? rawId : undefined;

    const alunoData = {
      ...data,
      cpf,
      ...(idValido ? { id: idValido } : { id: undefined }),
    };

    // Remover id undefined do objeto para evitar conflito no Prisma
    if (!idValido) delete alunoData.id;

    // 1. Upsert Aluno (pelo CPF como chave de identificação principal para o n8n)
    let aluno;
    if (cpf) {
      aluno = await prisma.aluno.upsert({
        where: { cpf },
        update: {
          ...alunoData,
          updated_at: new Date()
        },
        create: {
          ...alunoData,
          matricula: alunoData.matricula || `MAT-${Date.now()}`,
        }
      });
    } else if (idValido) {
       aluno = await prisma.aluno.upsert({
        where: { id: idValido },
        update: {
          ...alunoData,
          updated_at: new Date()
        },
        create: {
          ...alunoData,
          matricula: alunoData.matricula || `MAT-${Date.now()}`,
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
