import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [archivedOS, archivedTasks] = await Promise.all([
      prisma.oS.findMany({
        where: { arquivado: true },
        orderBy: { updated_at: "desc" },
      }),
      prisma.tarefa.findMany({
        where: { arquivado: true },
        orderBy: { updated_at: "desc" },
      })
    ]);

    // Normalizar Tarefas para o mesmo formato de OS para a tabela
    const normalizedTasks = archivedTasks.map(t => ({
      ...t,
      nome: t.titulo,
      numero: "MANUAL", // Tarefas manuais não têm número sequencial de OS
      status: "arquivado"
    }));

    const allArchived = [...archivedOS, ...normalizedTasks].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return NextResponse.json(allArchived, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar OS arquivadas" }, { status: 500 });
  }
}
