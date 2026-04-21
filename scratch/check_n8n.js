const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.n8nChatHistory.count();
    console.log('n8nChatHistory count:', count);
  } catch (e) {
    console.log('n8nChatHistory table probably does not exist or error:', e.message);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
