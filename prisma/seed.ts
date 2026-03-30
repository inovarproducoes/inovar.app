import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Operação Inovar 2.0: Semeando a Elite (OS Edition) ---');
  
  console.log('Limpando banco de dados (Respeitando Histórico n8n)...');
  // Não deletamos n8n_chat_histories aqui!
  await prisma.tarefa.deleteMany();
  await prisma.coluna.deleteMany();
  await prisma.quadro.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.oS.deleteMany();
  console.log('Semeando Clientes CRM (Elite)...');
  await prisma.cliente.create({
    data: { 
      nome: 'Escola Adventista', 
      telefone: '(62) 3222-2222', 
      email: 'adventista@email.com', 
      fonte: 'Instagram', 
      lead_score: 95 
    }
  });

  console.log('Semeando Turmas e Alunos...');
  const turma = await prisma.turma.create({ 
    data: { nome: '3º Ano A - Médio', ano: 2026, ano_letivo: 2026, periodo: 'matutino', curso: 'Ensino Médio' } 
  });

  const h = await prisma.aluno.create({
    data: {
      nome: 'Henrique (Aluno V.I.P)',
      matricula: '20260001',
      idade: 25,
      email: 'henrique@inovar.app',
      telefone: '(62) 98888-0000',
      turma: turma.nome,
      curso: turma.curso,
      cidade: 'Goiânia',
      responsavel: 'Responsável Master',
      cpf_responsavel: '11023608138',
      status: 'ativo'
    }
  });

  console.log('Semeando Dashboard de OS...');

  console.log('Semeando Quadro Kanban OS Povoado...');
  const q = await prisma.quadro.create({
    data: { nome: 'Kanban OS', descricao: 'Gestão de Chamadas do SGE' }
  });

  const c1 = await prisma.coluna.create({ data: { nome: 'Chamadas Abertas', ordem: 0, quadro_id: q.id } });
  await prisma.coluna.create({ data: { nome: 'Em Atendimento', ordem: 1, quadro_id: q.id } });
  await prisma.coluna.create({ data: { nome: 'Finalizadas', ordem: 2, quadro_id: q.id } });

  console.log('Inundando as Primeiras Ordens de Serviço (OS)...');
  const osData = [
    { numero: '1001', nome: 'Suporte Financeiro VIP', descricao: 'Ajuste de boleto para Henrique', status: 'pendente', responsavel_nome: 'Administrador' },
    { numero: '1002', nome: 'Manutenção de Cadastro', descricao: 'Seringa no CPF do aluno de teste', status: 'em_andamento', responsavel_nome: 'TI Inovar' },
    { numero: '1003', nome: 'Solicitação de Histórico', descricao: 'Documentação do 3º ano pedida via IA', status: 'pendente', responsavel_nome: 'Secretaria' },
  ];

  for (const os of osData) {
    await prisma.oS.create({ data: os });
  }

  console.log('--- Super Seed 2.1 Finalizado com Sucesso (Povoamento Ativado!) ---');
}

main()
  .catch((e) => {
    console.error('Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
