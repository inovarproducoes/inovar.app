const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const quadros = await prisma.quadro.findMany({
    include: { colunas: { include: { ordens_servico: true, tarefas: true } } }
  });

  console.log('--- BOARDS ---');
  quadros.forEach(q => {
    console.log(`ID: ${q.id} | Nome: ${q.nome} | Ativo: ${q.ativo} | Colunas: ${q.colunas.length}`);
    q.colunas.forEach(c => {
        console.log(`  Col: ${c.nome} | OS: ${c.ordens_servico.length} | Tarefas: ${c.tarefas.length}`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
