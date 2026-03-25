import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, format } from "date-fns";
import { createEventoSchema } from "@/lib/validators/eventoSchema";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dias = url.searchParams.get("dias");
  
  try {
    let eventos;
    if (dias) {
      const diasInt = parseInt(dias);
      const dataLimite = addDays(new Date(), diasInt);
      eventos = await prisma.evento.findMany({
        where: {
          data_inicio: {
            gte: format(new Date(), 'yyyy-MM-dd'),
            lte: format(dataLimite, 'yyyy-MM-dd')
          },
          status: { not: "cancelado" }
        },
        orderBy: { data_inicio: 'asc' }
      });
    } else {
      eventos = await prisma.evento.findMany({
        orderBy: { data_inicio: 'desc' }
      });
    }
    return NextResponse.json(eventos, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("GET /api/eventos:", error);
    return NextResponse.json({ error: "Erro ao buscar eventos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createEventoSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", detalhes: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newEvento = await prisma.evento.create({ data: validation.data });
    return NextResponse.json(newEvento, { status: 201 });
  } catch (error) {
    console.error("POST /api/eventos:", error);
    return NextResponse.json({ error: "Erro ao criar evento" }, { status: 500 });
  }
}
