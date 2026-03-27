const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const models = Object.keys(prisma).filter(k => !k.startsWith('_'));
    console.log("Modelos detectados no motor:", models.join(', '));
    
    if (models.includes('coluna')) {
      console.log("SUCESSO: Modelo 'coluna' está pronto!");
    } else {
      console.log("ERRO: Modelo 'coluna' NÃO foi carregado!");
    }
  } catch (err) {
    console.error("Erro técnico:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
