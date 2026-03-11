import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, format } from "date-fns";

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
          status: {
            not: "cancelado"
          }
        },
        orderBy: {
          data_inicio: 'asc'
        }
      });
    } else {
      eventos = await prisma.evento.findMany({
        orderBy: {
          data_inicio: 'desc'
        }
      });
    }
    return NextResponse.json(eventos);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar eventos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const newEvento = await prisma.evento.create({
      data
    });
    return NextResponse.json(newEvento, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar evento" }, { status: 500 });
  }
}
