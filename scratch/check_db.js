const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const quadros = await prisma.quadro.count();
  const colunas = await prisma.coluna.count();
  const os = await prisma.oS.count();
  const alunos = await prisma.aluno.count();
  const clientes = await prisma.cliente.count();
  const usuarios = await prisma.usuario.count();

  console.log('--- DATABASE STATS ---');
  console.log('Quadros:', quadros);
  console.log('Colunas:', colunas);
  console.log('OS:', os);
  console.log('Alunos:', alunos);
  console.log('Clientes:', clientes);
  console.log('Usuarios:', usuarios);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
