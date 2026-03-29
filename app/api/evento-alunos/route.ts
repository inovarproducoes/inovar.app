import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const evento_id = url.searchParams.get("evento_id");
  const aluno_id = url.searchParams.get("aluno_id");

  try {
    const where: any = {};
    if (evento_id) where.evento_id = evento_id;
    if (aluno_id) where.aluno_id = aluno_id;

    if (!evento_id && !aluno_id) {
       return NextResponse.json({ error: "evento_id ou aluno_id é obrigatório" }, { status: 400 });
    }

    const data = await prisma.eventoAluno.findMany({
      where,
      include: { 
        aluno: true,
        evento: true
      }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/evento-alunos:", error);
    return NextResponse.json({ error: "Erro ao buscar participantes do evento" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const novaVinculacao = await prisma.eventoAluno.create({ data });
    return NextResponse.json(novaVinculacao, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: "Aluno já vinculado ao evento" }, { status: 409 });
    }
    console.error("POST /api/evento-alunos:", error);
    return NextResponse.json({ error: "Erro ao vincular aluno ao evento" }, { status: 500 });
  }
}
