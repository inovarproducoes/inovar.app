import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { coluna_id, ordem } = await req.json();

    if (!id || !coluna_id) {
      return NextResponse.json({ error: 'ID e Coluna ID são obrigatórios' }, { status: 400 });
    }

    // Tentar atualizar como Tarefa
    try {
      const task = await prisma.tarefa.findUnique({ where: { id } });
      if (task) {
        const updated = await prisma.tarefa.update({
          where: { id },
          data: { 
            coluna_id,
            ordem: ordem !== undefined ? ordem : undefined
          }
        });
        return NextResponse.json(updated);
      }
    } catch {
      // Ignorar e tentar OS
    }

    // Tentar atualizar como OS
    try {
      const os = await prisma.oS.findUnique({ 
        where: { id },
        include: { coluna: true }
      });
      
      if (os) {
        // Buscar nome da nova coluna para atualizar o status da OS (opcional mas recomendado)
        const targetCol = await prisma.coluna.findUnique({ where: { id: coluna_id } });
        
        const updatedOS = await prisma.oS.update({
          where: { id },
          data: { 
            coluna_id,
            quadro_id: targetCol?.quadro_id,
            status: targetCol ? targetCol.nome.toLowerCase().replace(/\s+/g, '_') : os.status
          }
        });
        return NextResponse.json(updatedOS);
      }
    } catch (e) {
      console.error("Erro ao procurar OS", e);
    }

    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Tentar deletar como Tarefa
    try {
      await prisma.tarefa.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch { }

    // Tentar deletar como OS
    try {
      await prisma.oS.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch { }

    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar item' }, { status: 500 });
  }
}
