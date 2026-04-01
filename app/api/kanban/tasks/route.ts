import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { 
      titulo, 
      descricao, 
      coluna_id, 
      quadro_id, 
      prioridade, 
      responsavel_nome, 
      data_vencimento,
      instituicao,
      projeto_nome,
      isOS
    } = await req.json();

    if (!titulo || !coluna_id || !quadro_id) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    if (isOS === true) {
      const targetCol = await prisma.coluna.findUnique({ where: { id: coluna_id } });
      const osCount = await prisma.oS.count({ where: { coluna_id } });

      const newOS = await prisma.oS.create({
        data: {
          nome: titulo,
          descricao,
          coluna_id,
          quadro_id,
          responsavel_nome,
          instituicao,
          projeto_nome,
          status: targetCol ? targetCol.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_') : 'pendente',
          arquivado: false,
          ordem: osCount
        }
      });
      return NextResponse.json(newOS);
    } else {
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
          instituicao,
          projeto_nome,
          arquivado: false,
          data_vencimento: data_vencimento ? new Date(data_vencimento) : null,
          ordem: taskCount
        }
      });

      return NextResponse.json(task);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar tarefa' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id: rawId, coluna_id, ordem, titulo, descricao, prioridade, data_vencimento, numero } = body;
    const id = rawId?.toString().replace(/[\n\r\t]/g, "").trim();

    if (id === undefined) {
      return NextResponse.json({ error: 'ID da tarefa obrigatório' }, { status: 400 });
    }

    // 1. Tentar atualizar como Tarefa
    try {
      if (id && id.length > 10) { // Check if looks like a UUID
        const task = await prisma.tarefa.findUnique({ where: { id } });
        if (task) {
          const updatedTask = await prisma.tarefa.update({
            where: { id },
            data: {
              coluna_id: coluna_id || undefined,
              ordem: ordem !== undefined ? ordem : undefined,
              titulo: titulo || undefined,
              descricao: descricao !== undefined ? descricao : undefined,
              prioridade: prioridade || undefined,
              data_vencimento: data_vencimento ? new Date(data_vencimento) : undefined
            }
          });
          return NextResponse.json(updatedTask);
        }
      }
    } catch (e) { 
      console.log("Not a Tarefa or error:", e);
    }

    // 2. Tentar atualizar como OS
    try {
      let os = id ? await prisma.oS.findUnique({ where: { id } }) : null;
      
      // Fallback para numero se id for vazio ou não encontrado
      if (!os && numero) {
        os = await prisma.oS.findFirst({ where: { numero: String(numero) } });
      }
      
      if (os) {
         const targetCol = coluna_id ? await prisma.coluna.findUnique({ where: { id: coluna_id } }) : null;
         
         const updatedOS = await prisma.oS.update({
           where: { id: os.id },
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
    console.error("Critical error in PUT handler:", error);
    return NextResponse.json({ error: 'Erro ao atualizar item (PUT)' }, { status: 500 });
  }
}
