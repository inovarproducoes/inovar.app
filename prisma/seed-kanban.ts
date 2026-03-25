import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Criando Quadro Inicial...');
  
  // Create first board
  const board = await prisma.quadro.create({
    data: {
      nome: 'Gestão de Formaturas 2025',
      descricao: 'Acompanhamento de tarefas críticas para o sucesso das formaturas',
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

  console.log('Criando Tarefas...');
  const backlogId = board.colunas.find(c => c.nome === 'Backlog')?.id;
  const inProgressId = board.colunas.find(c => c.nome === 'Em Andamento')?.id;

  if (backlogId) {
    await prisma.tarefa.createMany({
      data: [
        { titulo: 'Contratar Floricultura', descricao: 'Orçar com 3 fornecedores diferentes', prioridade: 'media', coluna_id: backlogId, quadro_id: board.id, ordem: 0, etiquetas: ['Suprimentos'] },
        { titulo: 'Definir Playlist DJ', descricao: 'Validar com a comissão de formatura', prioridade: 'baixa', coluna_id: backlogId, quadro_id: board.id, ordem: 1, etiquetas: ['Entretenimento'] },
      ]
    });
  }

  if (inProgressId) {
    await prisma.tarefa.create({
      data: { titulo: 'Enviar Convites Oficiais', descricao: 'Digital e impresso para os oradores', prioridade: 'alta', coluna_id: inProgressId, quadro_id: board.id, ordem: 0, etiquetas: ['Comunicação'] }
    });
  }

  console.log('Quadro Kanban inicializado com sucesso!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
