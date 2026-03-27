import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { nome, quadro_id, ordem } = await req.json();

    if (!nome || !quadro_id) {
      return NextResponse.json({ error: 'Nome e Quadro ID são obrigatórios' }, { status: 400 });
    }

    const columnCount = await prisma.coluna.count({
      where: { quadro_id }
    });

    const column = await prisma.coluna.create({
      data: {
        nome,
        quadro_id,
        ordem: ordem ?? columnCount
      }
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar coluna' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, nome, ordem } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID da coluna é obrigatório' }, { status: 400 });
    }

    const column = await prisma.coluna.update({
      where: { id },
      data: { 
        nome: nome || undefined,
        ordem: ordem !== undefined ? ordem : undefined
      }
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar coluna' }, { status: 500 });
  }
}
