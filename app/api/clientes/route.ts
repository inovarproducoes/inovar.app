import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const termo = url.searchParams.get("termo");

  try {
    const clientes = await prisma.cliente.findMany({
      where: termo
        ? {
            OR: [
              { nome: { contains: termo, mode: 'insensitive' } },
              { telefone: { contains: termo } }
            ]
          }
        : undefined,
      orderBy: { nome: 'asc' }
    });
    return NextResponse.json(clientes, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nome, telefone, agente_ativo, documento, ...rest } = await req.json();
    
    // Ignoramos 'documento' propositalmente pois foi removido do banco
    const payload = {
      nome,
      telefone,
      agente_ativo: agente_ativo ?? true,
      ...rest
    };

    const existing = await prisma.cliente.findUnique({
      where: { telefone: payload.telefone }
    });
    
    if (existing) {
      return NextResponse.json({ error: "Telefone já existe", id: existing.id }, { status: 409 });
    }
    
    const newCliente = await prisma.cliente.create({ data: payload });
    return NextResponse.json(newCliente, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
