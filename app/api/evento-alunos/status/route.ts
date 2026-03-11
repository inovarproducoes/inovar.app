import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const evento_id = url.searchParams.get("evento_id");
  const aluno_id = url.searchParams.get("aluno_id");

  if (!evento_id || !aluno_id) return NextResponse.json({ error: "Missing ids" }, { status: 400 });

  try {
    const data = await req.json();
    const updated = await prisma.eventoAluno.update({
      where: { evento_id_aluno_id: { evento_id, aluno_id } },
      data: { status_participacao: data.status }
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const evento_id = url.searchParams.get("evento_id");
  const aluno_id = url.searchParams.get("aluno_id");

  if (!evento_id || !aluno_id) return NextResponse.json({ error: "Missing ids" }, { status: 400 });

  try {
    await prisma.eventoAluno.delete({
      where: { evento_id_aluno_id: { evento_id, aluno_id } }
    });
    return NextResponse.json({ message: "Desvinculado" });
  } catch (err) {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
