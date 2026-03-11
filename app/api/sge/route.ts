import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  
  const webhookUrl = process.env.N8N_SGE_WEBHOOK;
  if (!webhookUrl) return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 });

  try {
    const targetUrl = new URL(webhookUrl);
    searchParams.forEach((value, key) => targetUrl.searchParams.append(key, value));

    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
        return NextResponse.json({ error: "Erro na API_SGE" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: `Erro interno no proxy SGE: ${error}` }, { status: 500 });
  }
}
