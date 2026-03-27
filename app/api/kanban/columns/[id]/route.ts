import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { targetColumnId } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID da coluna é obrigatório' }, { status: 400 });
    }

    if (targetColumnId) {
      // Mover tarefas da coluna deletada para a nova coluna
      await prisma.tarefa.updateMany({
        where: { coluna_id: id },
        data: { coluna_id: targetColumnId }
      });

      // Mover OS da coluna deletada para a nova coluna
      await prisma.oS.updateMany({
        where: { coluna_id: id },
        data: { coluna_id: targetColumnId }
      });
    }

    // Deletar a coluna
    await prisma.coluna.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar coluna' }, { status: 500 });
  }
}
