import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      select: { financeiro_parcelas: true },
    });

    if (!aluno) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    // O n8n envia um array JSON direto. Se for null, retorna array vazio.
    let parcelas = aluno.financeiro_parcelas ? (aluno.financeiro_parcelas as any) : [];
    
    // Garantir que seja sempre um array (caso o SGE mande um objeto único)
    if (!Array.isArray(parcelas)) {
        parcelas = [parcelas];
    }
    
    // Ordenar parcelas pela data de vencimento (se disponível)
    parcelas.sort((a: any, b: any) => {
        if (!a.DataVencimento || !b.DataVencimento) return 0;
        return new Date(a.DataVencimento).getTime() - new Date(b.DataVencimento).getTime();
    });

    return NextResponse.json(parcelas);
  } catch (error) {
    console.error("Erro ao ler parcelas do aluno:", error);
    return NextResponse.json({ error: "Erro ao buscar dados financeiros" }, { status: 500 });
  }
}
