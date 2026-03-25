import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const webhookBase = process.env.N8N_WEBHOOK_BASE;
  if (!webhookBase) {
    return NextResponse.json({ error: "Integração n8n não configurada" }, { status: 503 });
  }
  try {
    const body = await req.json();
    const res = await fetch(`${webhookBase}/conversas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar histórico de conversas" }, { status: 500 });
  }
}
