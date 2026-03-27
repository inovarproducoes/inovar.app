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
            },
            ordens_servico: {
              orderBy: { created_at: 'desc' }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Mapear as OS para o formato de tarefas para o Kanban exibir de forma transparente
    const boardsWithOS = boards.map(board => {
      return {
        ...board,
        colunas: board.colunas.map(col => {
          const osAsTasks = col.ordens_servico.map(os => ({
            id: os.id,
            titulo: `#OS-${os.numero}: ${os.nome}`,
            descricao: os.descricao || 'Sem descrição',
            status: os.status,
            ordem: -1, 
            prioridade: 'alta',
            coluna_id: col.id,
            quadro_id: board.id,
            etiquetas: ['OS'],
            isOS: true,
            numero_os: String(os.numero)
          }));

          return {
            ...col,
            tarefas: [...osAsTasks, ...col.tarefas].sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
          };
        })
      };
    });

    return NextResponse.json(boardsWithOS);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar quadros' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nome, descricao, evento_id, isServiceOrderPipeline } = await req.json();

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
        evento_id,
        colunas: {
          create: defaultColumns
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
