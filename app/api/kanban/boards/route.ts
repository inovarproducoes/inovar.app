import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const boards = await prisma.quadro.findMany({
      where: { arquivado: false },
      include: {
        colunas: {
          orderBy: { ordem: 'asc' },
          include: {
            tarefas: {
              where: { arquivado: false },
              orderBy: { ordem: 'asc' }
            },
            ordens_servico: {
              where: { arquivado: false },
              orderBy: { ordem: 'asc' }
            }
          }
        }
      },
      orderBy: [
        { ativo: 'desc' },
        { created_at: 'desc' }
      ]
    });

    const boardsWithOS = boards.map(board => {
      return {
        ...board,
        colunas: board.colunas.map(col => {
          const osAsTasks = col.ordens_servico.map(os => ({
            id: os.id,
            titulo: os.nome,
            descricao: os.descricao || 'Sem descrição',
            status: os.status,
            ordem: os.ordem || 0, 
            prioridade: 'alta' as const,
            coluna_id: col.id,
            quadro_id: board.id,
            etiquetas: ['OS'],
            isOS: true,
            numero_os: String(os.numero),
            responsavel_nome: os.responsavel_nome || os.aluno_nome,
            aluno_nome: os.aluno_nome,
            aluno_cpf: os.aluno_cpf,
            projeto_nome: os.projeto_nome,
            instituicao: os.instituicao,
            arquivado: os.arquivado,
            created_at: os.created_at
          }));

          const allTasks = [...osAsTasks, ...col.tarefas];

          return {
            ...col,
            tarefas: allTasks.sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
          };
        })
      };
    });

    return NextResponse.json(boardsWithOS, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar quadros' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nome, descricao, isServiceOrderPipeline } = await req.json();

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const defaultColumns = isServiceOrderPipeline 
      ? [
          { nome: 'Nova OS', ordem: 0 },
          { nome: 'Em Atendimento', ordem: 1 },
          { nome: 'Em Impedimento', ordem: 2 },
          { nome: 'Concluída', ordem: 3 }
        ]
      : [
          { nome: 'Backlog', ordem: 0 },
          { nome: 'Em Andamento', ordem: 1 },
          { nome: 'Revisão', ordem: 2 },
          { nome: 'Concluído', ordem: 3 }
        ];

    const board = await prisma.quadro.create({
      data: {
        nome,
        descricao,
        colunas: { create: defaultColumns }
      },
      include: { colunas: true }
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar quadro' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ativo, arquivado, nome, descricao } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });

    if (ativo === true) {
      // Garantir que apenas um quadro seja ativo por vez
      await prisma.quadro.updateMany({
        where: { id: { not: id } },
        data: { ativo: false }
      });
    }

    if (arquivado === true) {
      // Arquivamento em cascata: quadro + todas as tarefas e OS dele
      return await prisma.$transaction(async (tx) => {
        const board = await tx.quadro.update({
          where: { id },
          data: { arquivado: true, ativo: false }
        });

        await tx.tarefa.updateMany({
          where: { quadro_id: id },
          data: { arquivado: true }
        });

        await tx.oS.updateMany({
          where: { quadro_id: id },
          data: { arquivado: true, status: 'arquivada' }
        });

        return NextResponse.json(board);
      });
    }

    const board = await prisma.quadro.update({
      where: { id },
      data: {
        nome: nome || undefined,
        descricao: descricao !== undefined ? descricao : undefined,
        ativo: ativo !== undefined ? ativo : undefined,
      }
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar quadro' }, { status: 500 });
  }
}
