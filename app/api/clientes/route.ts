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
              { telefone: { contains: termo, mode: 'insensitive' } }
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
    
    const payload = {
      nome: body.nome as string,
      telefone: body.telefone as string,
      email: body.email as string || null,
      empresa: body.empresa as string || null,
      interesse: body.interesse as string || null,
      lead_score: (body.lead_score ?? 0) as number,
      fonte: (body.fonte ?? "whatsapp") as string,
      agente_ativo: (body.agente_ativo ?? true) as boolean,
      observacoes: body.observacoes as string || null
    };

    const existing = await prisma.cliente.findUnique({
      where: { telefone: payload.telefone }
    });
    
    let cliente;
    if (existing) {
      cliente = await prisma.cliente.update({
        where: { id: existing.id },
        data: payload
      });
      console.log(`Cliente atualizado: ${cliente.nome} (${cliente.telefone})`);
    } else {
      cliente = await prisma.cliente.create({ data: payload });
      console.log(`Novo cliente criado: ${cliente.nome}`);
    }
    
    const newCliente = cliente; // Alias for compatibility with the rest of the code

    // AUTOMAÇÃO SÊNIOR: Criar uma tarefa no Kanban automaticamente
    try {
        const backlogColumn = await prisma.coluna.findFirst({
            where: { nome: { contains: "Backlog", mode: 'insensitive' } },
            orderBy: { created_at: 'asc' }
        });

        if (backlogColumn) {
            await prisma.tarefa.create({
                data: {
                    titulo: `Lead Quente: ${newCliente.nome}`,
                    descricao: `Interesse: ${newCliente.interesse || "Conversa via WhatsApp"}\nEmpresa: ${newCliente.empresa || "N/A"}\nTelefone: ${newCliente.telefone}`,
                    prioridade: payload.lead_score > 50 ? "alta" : "media",
                    responsavel_nome: "Henrique", // Default pra você!
                    ordem: 0,
                    etiquetas: "Lead,CRM,Automático",
                    coluna_id: backlogColumn.id,
                    quadro_id: backlogColumn.quadro_id
                }
            });
            console.log("Tarefa de lead criada com sucesso!");
        }
    } catch (err) {
        console.error("Falha ao criar tarefa automática:", err);
    }

    return NextResponse.json(newCliente, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente/tarefa:", error);
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id")?.replace(/[\n\r\t]/g, "").trim();

  if (!id) {
    return NextResponse.json({ error: "ID de cliente obrigatório" }, { status: 400 });
  }

  try {
    await prisma.cliente.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 });
  }
}
