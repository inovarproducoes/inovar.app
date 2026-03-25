import { NextResponse } from 'next/server';
import { PrismaClient, PrioridadeTarefa } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { titulo, descricao, coluna_id, quadro_id, prioridade, responsavel_nome, data_vencimento } = await req.json();

    if (!titulo || !coluna_id || !quadro_id) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Get number of tasks in the target column to set the new task's order
    const taskCount = await prisma.tarefa.count({
      where: { coluna_id }
    });

    const task = await prisma.tarefa.create({
      data: {
        titulo,
        descricao,
        coluna_id,
        quadro_id,
        prioridade: (prioridade as PrioridadeTarefa) || 'media',
        responsavel_nome,
        data_vencimento: data_vencimento ? new Date(data_vencimento) : null,
        ordem: taskCount
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, coluna_id, ordem, titulo, descricao, prioridade, data_vencimento } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID da tarefa obrigatório' }, { status: 400 });
    }

    const task = await prisma.tarefa.update({
      where: { id },
      data: {
        coluna_id,
        ordem,
        titulo,
        descricao,
        prioridade: (prioridade as PrioridadeTarefa),
        data_vencimento: data_vencimento ? new Date(data_vencimento) : undefined
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar tarefa' }, { status: 500 });
  }
}
