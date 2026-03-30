import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { 
      coluna_id, 
      ordem, 
      titulo, 
      descricao, 
      prioridade, 
      responsavel_nome,
      aluno_nome,
      aluno_cpf,
      projeto_nome,
      instituicao
    } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Tentar atualizar como Tarefa
    try {
      const task = await prisma.tarefa.findUnique({ where: { id } });
      if (task) {
        const updated = await prisma.tarefa.update({
          where: { id },
          data: { 
            coluna_id: coluna_id || undefined,
            ordem: ordem !== undefined ? ordem : undefined,
            titulo: titulo || undefined,
            descricao: descricao !== undefined ? descricao : undefined,
            prioridade: prioridade || undefined,
            responsavel_nome: responsavel_nome !== undefined ? responsavel_nome : undefined,
          }
        });
        return NextResponse.json(updated);
      }
    } catch { }

    // Tentar atualizar como OS
    try {
      const os = await prisma.oS.findUnique({ 
        where: { id },
        include: { coluna: true }
      });
      
      if (os) {
        const targetCol = coluna_id ? await prisma.coluna.findUnique({ where: { id: coluna_id } }) : null;
        
        const updatedOS = await prisma.oS.update({
          where: { id },
          data: { 
            coluna_id: coluna_id || undefined,
            quadro_id: targetCol ? targetCol.quadro_id : undefined,
            status: targetCol ? targetCol.nome.toLowerCase().replace(/\s+/g, '_') : undefined,
            nome: titulo || undefined, // Mapeado de titulo para nome na OS
            descricao: descricao !== undefined ? descricao : undefined,
            responsavel_nome: responsavel_nome !== undefined ? responsavel_nome : undefined,
            aluno_nome: aluno_nome !== undefined ? aluno_nome : undefined,
            aluno_cpf: aluno_cpf !== undefined ? aluno_cpf : undefined,
            projeto_nome: projeto_nome !== undefined ? projeto_nome : undefined,
            instituicao: instituicao !== undefined ? instituicao : undefined,
          }
        });
        return NextResponse.json(updatedOS);
      }
    } catch (e) {
      console.error("Erro ao atualizar OS", e);
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
