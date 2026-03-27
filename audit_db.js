const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("--- Auditoria Inovar 2.0 ---");
    const faqCount = await prisma.fAQ.count();
    console.log("Total de FAQs:", faqCount);
    
    const faqs = await prisma.fAQ.findMany({ take: 3 });
    console.log("Perguntas de Exemplo:", faqs.map(f => f.pergunta));
    
    const alunos = await prisma.aluno.findMany({ 
      where: { status: 'ativo' },
      take: 5 
    });
    console.log("Alunos Encontrados:", alunos.length);
    console.log("CPFs de Teste (Responsáveis):", alunos.map(a => a.cpf_responsavel));
    
    const clientes = await prisma.cliente.findMany({ take: 3 });
    console.log("Clientes no CRM:", clientes.map(c => c.nome));
    
  } catch (e) {
    console.error("Erro na Auditoria:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
