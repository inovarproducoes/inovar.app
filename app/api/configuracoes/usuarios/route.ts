import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await prisma.usuario.findMany({
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        foto_url: true,
        permissoes: true,
        created_at: true,
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nome, email, senha, role, permissoes } = await req.json();

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const hash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha_hash: hash,
        role: role || "user",
        permissoes: permissoes || {},
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, nome, role, ativo, permissoes, senha } = await req.json();

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const data: any = {
      nome: nome || undefined,
      role: role || undefined,
      ativo: ativo !== undefined ? ativo : undefined,
      permissoes: permissoes || undefined,
    };

    if (senha) {
      data.senha_hash = await bcrypt.hash(senha, 10);
    }

    const user = await prisma.usuario.update({
      where: { id },
      data
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}
