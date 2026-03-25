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
              { nome: { contains: termo } },
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
    const body = await req.json();
    
    // Filtramos o payload para salvar SOMENTE os campos necessários,
    // garantindo que campos extras do n8n (como documento) não quebrem o banco.
    const payload = {
      nome: body.nome as string,
      telefone: body.telefone as string,
      agente_ativo: (body.agente_ativo ?? true) as boolean
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
