import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const boards = await prisma.quadro.findMany({
      include: {
        colunas: {
          orderBy: { ordem: 'asc' },
          include: {
            tarefas: {
              orderBy: { ordem: 'asc' }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return NextResponse.json(boards);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar quadros' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nome, descricao, evento_id } = await req.json();

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const board = await prisma.quadro.create({
      data: {
        nome,
        descricao,
        evento_id,
        colunas: {
          create: [
            { nome: 'Backlog', ordem: 0 },
            { nome: 'Em Andamento', ordem: 1 },
            { nome: 'Revisão', ordem: 2 },
            { nome: 'Concluído', ordem: 3 }
          ]
        }
      },
      include: {
        colunas: true
      }
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar quadro' }, { status: 500 });
  }
}
