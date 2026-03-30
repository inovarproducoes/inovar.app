import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ autenticado: false }, { status: 401 });
    }
    return NextResponse.json({
      autenticado: true,
      usuario: {
        id: session.userId,
        email: session.email,
        nome: session.nome,
        role: session.role,
      },
    });
  } catch (error) {
    console.error("[SESSAO] Erro:", error);
    return NextResponse.json({ autenticado: false }, { status: 401 });
  }
}
