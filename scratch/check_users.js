const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany();
  console.log('--- USERS ---');
  users.forEach(u => console.log(`${u.nome} (${u.email}) - Role: ${u.role}`));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
