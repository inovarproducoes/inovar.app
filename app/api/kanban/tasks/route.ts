import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

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
        prioridade: prioridade || 'media',
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

    // Aceita id vazio (de automações mal configuradas), mas tem que ter na request
    if (id === undefined) {
      return NextResponse.json({ error: 'ID da tarefa obrigatório' }, { status: 400 });
    }

    // 1. Tentar atualizar como Tarefa
    try {
      const task = await prisma.tarefa.findUnique({ where: { id } });
      if (task) {
        const updatedTask = await prisma.tarefa.update({
          where: { id },
          data: {
            coluna_id,
            ordem,
            titulo,
            descricao,
            prioridade: prioridade,
            data_vencimento: data_vencimento ? new Date(data_vencimento) : undefined
          }
        });
        return NextResponse.json(updatedTask);
      }
    } catch { 
      // Ignora erro se não for UUID válido para a tabela de tarefas
    }

    // 2. Tentar atualizar como OS
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
             ordem: ordem !== undefined ? ordem : undefined,
             quadro_id: targetCol ? targetCol.quadro_id : undefined,
             status: targetCol ? targetCol.nome
               .toLowerCase()
               .normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "")
               .replace(/\s+/g, '_') : undefined,
             nome: titulo || undefined, 
             descricao: descricao !== undefined ? descricao : undefined,
           }
         });
         return NextResponse.json(updatedOS);
      }
    } catch (e) {
      console.error("Erro ao atualizar OS em PUT", e);
    }

    return NextResponse.json({ error: 'Item não encontrado (PUT)' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar item (PUT)' }, { status: 500 });
  }
}
