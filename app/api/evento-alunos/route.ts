import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const evento_id = url.searchParams.get("evento_id");
  if (!evento_id) return NextResponse.json({ error: "evento_id é obrigatório" }, { status: 400 });

  try {
    const data = await prisma.eventoAluno.findMany({
      where: { evento_id },
      include: { aluno: true }
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const novaVinculacao = await prisma.eventoAluno.create({ data });
    return NextResponse.json(novaVinculacao, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: "Aluno já vinculado ao evento" }, { status: 409 });
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
