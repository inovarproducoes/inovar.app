import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const evento_id = url.searchParams.get("evento_id");
  const aluno_id = url.searchParams.get("aluno_id");

  if (!evento_id || !aluno_id) {
    return NextResponse.json({ error: "evento_id e aluno_id são obrigatórios" }, { status: 400 });
  }

  try {
    const data = await req.json();
    const updated = await prisma.eventoAluno.update({
      where: { evento_id_aluno_id: { evento_id, aluno_id } },
      data: { status_participacao: data.status }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/evento-alunos/status:", error);
    return NextResponse.json({ error: "Erro ao atualizar status de participação" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const evento_id = url.searchParams.get("evento_id");
  const aluno_id = url.searchParams.get("aluno_id");

  if (!evento_id || !aluno_id) {
    return NextResponse.json({ error: "evento_id e aluno_id são obrigatórios" }, { status: 400 });
  }

  try {
    await prisma.eventoAluno.delete({
      where: { evento_id_aluno_id: { evento_id, aluno_id } }
    });
    return NextResponse.json({ message: "Vínculo removido com sucesso" });
  } catch (error) {
    console.error("DELETE /api/evento-alunos/status:", error);
    return NextResponse.json({ error: "Erro ao desvincular aluno do evento" }, { status: 500 });
  }
}
