import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all non-archived OS with their column info for accurate counting
    const todasOS = await prisma.oS.findMany({
      where: { arquivado: false },
      include: { coluna: { select: { nome: true } } },
      orderBy: { created_at: "desc" },
    });

    // Normalize column name to key for comparison
    const normalize = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");

    // Count by physical column name (reliable regardless of status string)
    const ABERTAS_COLS   = ["nova_os", "nova", "novo", "em_atendimento", "em_impedimento", "impedimento", "atendimento"];
    const FINALIZADAS_COLS = ["concluida", "concluido", "finalizado", "finalizada", "concluida_os"];

    const abertas = todasOS.filter(os => {
      const colNome = os.coluna ? normalize(os.coluna.nome) : normalize(os.status);
      return ABERTAS_COLS.some(c => colNome.includes(c));
    }).length;

    const finalizadas = todasOS.filter(os => {
      const colNome = os.coluna ? normalize(os.coluna.nome) : normalize(os.status);
      return FINALIZADAS_COLS.some(c => colNome.includes(c));
    }).length;

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
        emAndamento: abertas, // alias kept for compatibility  
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
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Erro em /api/os/stats:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
