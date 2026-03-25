import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateEventoSchema } from "@/lib/validators/eventoSchema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        participantes: true,
        evento_alunos: { include: { aluno: true } }
      }
    });
    if (!evento) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }
    return NextResponse.json(evento);
  } catch (error) {
    console.error("GET /api/eventos/[id]:", error);
    return NextResponse.json({ error: "Erro ao buscar evento" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Verificar se existe
    const existing = await prisma.evento.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const validation = updateEventoSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedEvento = await prisma.evento.update({
      where: { id },
      data: validation.data
    });
    return NextResponse.json(updatedEvento);
  } catch (error) {
    console.error("PUT /api/eventos/[id]:", error);
    return NextResponse.json({ error: "Erro ao atualizar evento" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const existing = await prisma.evento.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
    }
    await prisma.evento.delete({ where: { id } });
    return NextResponse.json({ message: "Evento deletado com sucesso" });
  } catch (error) {
    console.error("DELETE /api/eventos/[id]:", error);
    return NextResponse.json({ error: "Erro ao deletar evento" }, { status: 500 });
  }
}
