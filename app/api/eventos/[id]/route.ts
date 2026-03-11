import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        participantes: true,
        evento_alunos: {
          include: {
            aluno: true
          }
        }
      }
    });
    if (!evento) return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    return NextResponse.json(evento);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar evento" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await req.json();
    const updatedEvento = await prisma.evento.update({
      where: { id },
      data
    });
    return NextResponse.json(updatedEvento);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar evento" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.evento.delete({ where: { id } });
    return NextResponse.json({ message: "Evento deletado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar evento" }, { status: 500 });
  }
}
