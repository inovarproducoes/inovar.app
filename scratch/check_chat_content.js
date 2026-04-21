const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const samples = await prisma.n8nChatHistory.findMany({
    take: 5,
    orderBy: { id: 'desc' }
  });

  console.log('--- CHAT HISTORY SAMPLES ---');
  samples.forEach(s => {
    console.log(`ID: ${s.id} | Session: ${s.session_id}`);
    console.log(`Message: ${JSON.stringify(s.message, null, 2)}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
