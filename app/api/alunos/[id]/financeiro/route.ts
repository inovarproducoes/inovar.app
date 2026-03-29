import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const parcelas = await prisma.parcela.findMany({
      where: { aluno_id: id },
      orderBy: { data_vencimento: "asc" },
    });

    return NextResponse.json(parcelas);
  } catch (error) {
    console.error("Erro ao buscar parcelas:", error);
    return NextResponse.json({ error: "Erro ao buscar dados financeiros" }, { status: 500 });
  }
}
