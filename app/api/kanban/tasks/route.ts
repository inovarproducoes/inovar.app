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
      isOS,
      numero,
      aluno_nome,
      aluno_cpf,
      aluno2_nome,
      aluno2_cpf,
    } = await req.json();

    if (!titulo || !coluna_id || !quadro_id) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    if (isOS === true) {
      const targetCol = await prisma.coluna.findUnique({ where: { id: coluna_id } });
      const colStatus = targetCol
        ? targetCol.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_')
        : 'pendente';

      // Se vier com número (N8N), fazer upsert para evitar duplicatas
      if (numero) {
        const numeroStr = String(numero).replace(/[\n\r\t]/g, '').trim();
        const existing = await prisma.oS.findFirst({ where: { numero: numeroStr } });

        if (existing) {
          // Atualiza dados da OS, mas preserva coluna_id se já foi posicionada manualmente
          const updated = await prisma.oS.update({
            where: { id: existing.id },
            data: {
              nome: titulo,
              descricao: descricao ?? existing.descricao,
              responsavel_nome: responsavel_nome ?? existing.responsavel_nome,
              aluno_nome: aluno_nome ?? existing.aluno_nome,
              aluno_cpf: aluno_cpf ?? existing.aluno_cpf,
              aluno2_nome: aluno2_nome ?? existing.aluno2_nome,
              aluno2_cpf: aluno2_cpf ?? existing.aluno2_cpf,
              instituicao: instituicao ?? existing.instituicao,
              projeto_nome: projeto_nome ?? existing.projeto_nome,
              arquivado: false,
              // Só atualiza coluna/quadro/status se a OS ainda não tem coluna definida
              ...(existing.coluna_id ? {} : {
                coluna_id,
                quadro_id,
                status: colStatus,
              }),
            }
          });
          return NextResponse.json(updated);
        }
      }

      const osCount = await prisma.oS.count({ where: { coluna_id } });

      const newOS = await prisma.oS.create({
        data: {
          nome: titulo,
          numero: numero ? String(numero).replace(/[\n\r\t]/g, '').trim() : undefined,
          descricao,
          coluna_id,
          quadro_id,
          responsavel_nome,
          aluno_nome,
          aluno_cpf,
          aluno2_nome,
          aluno2_cpf,
          instituicao,
          projeto_nome,
          status: colStatus,
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
      const foundById = !!os;

      // Fallback para numero se id for vazio ou não encontrado (fluxo N8N)
      if (!os && numero) {
        os = await prisma.oS.findFirst({ where: { numero: String(numero) } });
      }

      if (os) {
         const targetCol = coluna_id ? await prisma.coluna.findUnique({ where: { id: coluna_id } }) : null;

         // Se encontrado por número (N8N), preserva coluna_id existente para não desfazer
         // movimentações manuais feitas pelo usuário no Kanban.
         // Se encontrado por ID (drag-and-drop), sempre atualiza coluna_id.
         const novaColuna = foundById
           ? (coluna_id || undefined)
           : (os.coluna_id ? undefined : (coluna_id || undefined));

         const updatedOS = await prisma.oS.update({
           where: { id: os.id },
           data: {
             coluna_id: novaColuna,
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
