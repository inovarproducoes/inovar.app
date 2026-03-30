import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const todasOS = await prisma.oS.findMany({
      orderBy: { created_at: "desc" },
    });

    const abertas = todasOS.filter(os => ["pendente", "aberto", "nova", "novo", "na_fila"].includes(os.status.toLowerCase())).length;
    const emAndamento = todasOS.filter(os => ["em_andamento", "execucao", "atendimento", "analise", "desenvolvimento", "em andamento"].includes(os.status.toLowerCase())).length;
    const finalizadas = todasOS.filter(os => ["concluido", "concluída", "concluida", "finalizado", "finalizada", "resolvido", "fechado"].includes(os.status.toLowerCase())).length;

    const total = todasOS.length;
    const taxaFinalizacao = total > 0 ? Math.round((finalizadas / total) * 100) : 0;

    // Ordens de Serviço por Mês
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const osPorMesMap = new Array(12).fill(0);

    todasOS.forEach((os) => {
      const data = new Date(os.created_at);
      if (!isNaN(data.getTime())) {
        if (data.getFullYear() === new Date().getFullYear()) {
          osPorMesMap[data.getMonth()]++;
        }
      }
    });

    const osPorMes = osPorMesMap.map((count, idx) => ({ name: monthNames[idx], ordens: count }));
    const maxOs = Math.max(...osPorMesMap, 1);
    const osPorMesFormatado = osPorMes.map(m => ({
      ...m,
      height: Math.max((m.ordens / maxOs) * 160, 20),
    }));

    const recentes = todasOS.slice(0, 10);

    return NextResponse.json(
      {
        total,
        abertas,
        emAndamento,
        finalizadas,
        taxaFinalizacao,
        tendencias: { 
          total: total > 10 ? 5 : 0, 
          abertas: abertas > 5 ? -2 : 1, 
          finalizadas: finalizadas > 5 ? 12 : 0, 
          taxa: taxaFinalizacao > 50 ? 8 : -3 
        },
        osPorMes: osPorMesFormatado,
        recentes,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Erro em /api/os/stats:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
