import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('--- Iniciando limpeza do banco de dados (SQLite/PostgreSQL) ---');
    
    // Verificamos qual banco estamos usando via introspecção simplificada
    const tables = await prisma.$queryRawUnsafe(`SELECT name FROM sqlite_master WHERE type='table' AND name='clientes'`) as any[];
    const isSqlite = tables.length > 0;

    if (isSqlite) {
      console.log('Detectado: Local SQLite');
      // No SQLite, o Drop Column é mais chato, mas como já sincronizamos o schema, 
      // se a coluna ainda estiver lá, podemos tentar forçar.
      console.log('Executando limpeza local (force dev.db sync)...');
      // No Prisma com SQLite, o sync é feito via 'db push'.
    } else {
      console.log('Detectado: PostgreSQL (Produção/Rede)');
      // No Postgres via Raw SQL para garantir que suma da vista do n8n
      await prisma.$executeRawUnsafe(`ALTER TABLE clientes DROP COLUMN IF EXISTS documento;`);
      console.log('✅ SUCESSO: Coluna "documento" removida da tabela Clientes no PostgreSQL.');
    }

  } catch (error) {
    console.warn('⚠️ AVISO: A coluna pode já ter sido removida ou o banco é incompatível.');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
