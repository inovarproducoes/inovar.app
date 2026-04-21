import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
// Note: In a real app, you'd get the current user ID from session/JWT.
// Since we don't have the auth middleware logic fully visible here, 
// we'll assume the client sends the ID or we use a header.

export async function PATCH(req: Request) {
  try {
    const { id, nome, email, foto_url, senha_atual, nova_senha } = await req.json();

    if (!id) return NextResponse.json({ error: "ID não identificado" }, { status: 400 });

    const user = await prisma.usuario.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const data: any = {
      nome: nome || undefined,
      email: email || undefined,
      foto_url: foto_url || undefined,
    };

    if (nova_senha) {
      if (!senha_atual) return NextResponse.json({ error: "Senha atual necessária" }, { status: 400 });
      
      const match = await bcrypt.compare(senha_atual, user.senha_hash);
      if (!match) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 });

      data.senha_hash = await bcrypt.hash(nova_senha, 10);
    }

    const updated = await prisma.usuario.update({
      where: { id },
      data
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
