const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.quadro.updateMany({
    where: { nome: 'Fluxo Operacional OS' },
    data: { ativo: true }
  });
  console.log('Board activated:', result);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
