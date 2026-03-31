const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const board = await prisma.quadro.findFirst({
    where: { arquivado: false },
    include: { colunas: true }
  });

  if (!board) {
    console.log('No board found');
    return;
  }

  // Set as active if none is active
  const anyActive = await prisma.quadro.findFirst({ where: { ativo: true } });
  if (!anyActive) {
    await prisma.quadro.update({
      where: { id: board.id },
      data: { ativo: true }
    });
    console.log('Board set as active:', board.nome);
  }

  const col = board.colunas[0];
  if (!col) return;

  const testTasks = [
    {
      titulo: 'Teste: OS Manual (Escola Viva)',
      instituicao: 'Escola Viva',
      projeto_nome: 'Formatura 2024',
      coluna_id: col.id,
      quadro_id: board.id,
      prioridade: 'alta'
    },
    {
      titulo: 'Teste: OS Manual (Colégio Objetivo)',
      instituicao: 'Colégio Objetivo',
      projeto_nome: 'Eventos Esportivos',
      coluna_id: col.id,
      quadro_id: board.id,
      prioridade: 'media'
    }
  ];

  for (const t of testTasks) {
    await prisma.tarefa.create({ data: t });
  }

  console.log('Test cards created in board:', board.nome);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
