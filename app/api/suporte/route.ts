import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.N8N_SUPORTE_WEBHOOK;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Serviço de IA não configurado" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Erro no serviço de IA" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/suporte:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
