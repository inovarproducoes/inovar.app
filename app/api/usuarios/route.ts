import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
      },
      orderBy: { nome: 'asc' }
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("[USUARIOS] Erro:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}
