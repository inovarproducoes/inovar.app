import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSenha, gerarToken, setCookieHeader } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha } = await req.json();

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const emailNormalizado = email.toLowerCase().trim();

    const existente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (existente) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 409 });
    }

    const senhaHash = await hashSenha(senha);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: nome.trim(),
        email: emailNormalizado,
        senha_hash: senhaHash,
        role: "user",
      },
    });

    const token = gerarToken({
      userId: novoUsuario.id,
      email: novoUsuario.email,
      nome: novoUsuario.nome,
      role: novoUsuario.role,
    });

    const response = NextResponse.json({
      success: true,
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        role: novoUsuario.role,
      },
    });

    response.headers.set("Set-Cookie", setCookieHeader(token));
    return response;
  } catch (error) {
    console.error("[REGISTRO] Erro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
