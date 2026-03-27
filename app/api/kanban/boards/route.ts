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
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Se houver um quadro de OS, buscar os dados da tabela OS para exibir lá
    const ordensServico = await prisma.oS.findMany({
      orderBy: { created_at: 'desc' }
    });

    // Mapear as OS para o formato de tarefas para o Kanban exibir
    const boardsWithOS = boards.map(board => {
      if (board.nome.toLowerCase().includes('os')) {
        return {
          ...board,
          colunas: board.colunas.map(col => {
            // Se for a primeira coluna (ex: Backlog), injetar as OS lá
            if (col.ordem === 0) {
              const osAsTasks = ordensServico.map(os => ({
                id: os.id,
                titulo: `#OS-${os.numero}: ${os.nome}`,
                descricao: os.descricao || 'Chamada sem descrição',
                status: os.status,
                ordem: -1, // Garantir que fiquem no topo
                prioridade: 'alta',
                isOS: true // Flag para a UI saber que é uma OS
              }));
              return {
                ...col,
                tarefas: [...osAsTasks, ...col.tarefas]
              };
            }
            return col;
          })
        };
      }
      return board;
    });

    return NextResponse.json(boardsWithOS);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar quadros' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { nome, descricao, evento_id } = await req.json();

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const board = await prisma.quadro.create({
      data: {
        nome,
        descricao,
        evento_id,
        colunas: {
          create: [
            { nome: 'Backlog', ordem: 0 },
            { nome: 'Em Andamento', ordem: 1 },
            { nome: 'Revisão', ordem: 2 },
            { nome: 'Concluído', ordem: 3 }
          ]
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
