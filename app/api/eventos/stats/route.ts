import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const todosEventos = await prisma.evento.findMany({
      where: {
        status: {
          not: "cancelado"
        }
      },
      select: {
        data_inicio: true,
        capacidade_maxima: true,
        vagas_disponiveis: true,
        tipo_evento: true,
        status: true
      }
    });

    const now = new Date();
    
    // Calcula proximos eventos
    const proximos = todosEventos.filter(e => new Date(e.data_inicio) >= now).length;
    
    // Calcula totais
    const vagasOcupadas = todosEventos.reduce((sum, e) => sum + (e.capacidade_maxima - e.vagas_disponiveis), 0);
    const totalCapacidade = todosEventos.reduce((sum, e) => sum + e.capacidade_maxima, 0);
    const taxaOcupacao = totalCapacidade ? Math.round((vagasOcupadas / totalCapacidade) * 100) : 0;

    // Distribuicao por Mes
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const eventosPorMesMap = new Array(12).fill(0);
    
    // Distribuição por Tipo
    const distribuicaoMap: Record<string, number> = {};

    todosEventos.forEach((e) => {
      const data = new Date(e.data_inicio);
      if (!isNaN(data.getTime())) {
         eventosPorMesMap[data.getMonth()]++;
      }
      
      if (e.tipo_evento) {
         distribuicaoMap[e.tipo_evento] = (distribuicaoMap[e.tipo_evento] || 0) + 1;
      }
    });

    const eventosPorMes = eventosPorMesMap.map((total, idx) => ({
       name: monthNames[idx],
       total
    }));

    const maxEvents = Math.max(...eventosPorMesMap, 1);
    const eventosPorMesFormatado = eventosPorMes.map(m => ({
       ...m,
       height: Math.max((m.total / maxEvents) * 160, 20)
    }));

    const totalEventosTipos = Object.values(distribuicaoMap).reduce((a, b) => a + b, 0);
    const distribuicaoPorTipo = Object.entries(distribuicaoMap)
      .sort((a, b) => b[1] - a[1])
      .map(([tipo, count]) => ({
         tipo,
         percentual: totalEventosTipos ? Math.round((count / totalEventosTipos) * 100) : 0,
         count
      }));

    return NextResponse.json({
       total: todosEventos.length,
       proximos,
       vagasOcupadas,
       taxaOcupacao,
       tendencias: {
         total: 12, // valores mockados conforme design UI
         vagas: 8,
         taxa: 5
       },
       eventosPorMes: eventosPorMesFormatado,
       distribuicaoPorTipo
    });

  } catch (error) {
    console.error("Erro em /api/eventos/stats:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
