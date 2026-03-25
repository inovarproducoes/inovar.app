import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { StatusAluno } from "@/types/alunos";

const STATUS_ALUNO_VALIDOS: StatusAluno[] = [
  'ativo', 'inativo', 'transferido', 'formado',
  'inadimplente', 'trancado', 'concluido', 'cancelado'
];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const termo = url.searchParams.get("termo");
  const turma = url.searchParams.get("turma");
  const curso = url.searchParams.get("curso");
  const statusParam = url.searchParams.get("status");
  const status = statusParam && STATUS_ALUNO_VALIDOS.includes(statusParam as StatusAluno)
    ? (statusParam as StatusAluno)
    : null;
  
  try {
    const where: Prisma.AlunoWhereInput = {};
    if (termo) {
      where.OR = [
        { nome: { contains: termo, mode: 'insensitive' } },
        { matricula: { contains: termo, mode: 'insensitive' } },
        { email: { contains: termo, mode: 'insensitive' } },
        { cpf_responsavel: { contains: termo, mode: 'insensitive' } },
      ];
    }
    if (turma) where.turma = turma;
    if (curso) where.curso = curso;
    if (status) where.status = status;

    const alunos = await prisma.aluno.findMany({ where, orderBy: { nome: 'asc' } });
    return NextResponse.json(alunos, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar alunos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const existingAluno = await prisma.aluno.findFirst({
      where: {
        OR: [{ matricula: data.matricula }, { email: data.email }]
      }
    });

    if (existingAluno) {
      return NextResponse.json({ error: "Aluno com essa matrícula ou email já existe", id: existingAluno.id }, { status: 409 });
    }

    const newAluno = await prisma.aluno.create({ data });
    return NextResponse.json(newAluno, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar aluno" }, { status: 500 });
  }
}
