import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const archivedOS = await prisma.oS.findMany({
      where: { arquivado: true },
      orderBy: { updated_at: "desc" },
    });
    return NextResponse.json(archivedOS);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar OS arquivadas" }, { status: 500 });
  }
}
