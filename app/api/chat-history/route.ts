import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const history = await prisma.n8nChatHistory.findMany({
        where: { session_id: sessionId },
        orderBy: { id: "asc" },
      });
      return NextResponse.json(history);
    }

    // Se não tiver sessionId, retorna uma lista de sessões únicas
    const sessions = await prisma.$queryRaw`
      SELECT DISTINCT session_id, MAX(id) as last_id
      FROM n8n_chat_histories
      GROUP BY session_id
      ORDER BY last_id DESC
      LIMIT 100
    `;

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[CHAT_HISTORY] Erro:", error);
    return NextResponse.json({ error: "Erro ao buscar histórico" }, { status: 500 });
  }
}
