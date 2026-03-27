import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Operação Inovar 2.0: Semeando a Elite ---');
  
  console.log('Limpando banco de dados...');
  await prisma.tarefa.deleteMany();
  await prisma.coluna.deleteMany();
  await prisma.quadro.deleteMany();
  await prisma.eventoAluno.deleteMany();
  await prisma.participante.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.fAQ.deleteMany();

  console.log('Semeando FAQs Humanizadas (Persona de Elite)...');
  const faqs = [
    {
      categoria: 'Geral',
      pergunta: 'O que é o Inovar App?',
      resposta: 'Olá! O Inovar App é o seu braço direito na gestão de eventos e educação. Nós somos uma plataforma feita para simplificar a sua vida, cuidando de cada detalhe, desde o registro de um aluno até a organização de uma grande formatura. Tudo com tecnologia de ponta e um toque humano que faz toda a diferença! 😊',
      palavras_chave: 'inovar, sistema, suporte, ajuda'
    },
    {
      categoria: 'Suporte',
      pergunta: 'Como vejo minhas parcelas?',
      resposta: 'Basta me informar o seu CPF! Eu vou consultar o nosso sistema financeiro e te passar o valor, o vencimento e até o link para o pagamento via Pix ou Boleto. É rápido e seguro! 😉',
      palavras_chave: 'parcelas, pagamento, financeiro, boleto, pix, cpf'
    },
    {
      categoria: 'Eventos',
      pergunta: 'Quais os principais eventos de 2026?',
      resposta: 'Em 2026 teremos formaturas incríveis, como a de Engenharia Civil e a de Direito, além de workshops de IA e eventos culturais. Você pode acompanhar tudo detalhadamente no seu Dashboard no painel Visão Geral! 📊',
      palavras_chave: 'eventos, 2026, agenda, formatura'
    }
  ];

  for (const f of faqs) {
    await prisma.fAQ.create({ data: f });
  }

  console.log('Semeando Clientes (CRM)...');
  const clientesData = [
    { nome: 'SESI Goiânia', telefone: '(62) 3222-1111', email: 'sesi@email.com', fonte: 'Indicação', lead_score: 80 },
    { nome: 'Escola Adventista', telefone: '(62) 3222-2222', email: 'adventista@email.com', fonte: 'Instagram', lead_score: 95 },
    { nome: 'Colégio Objetivo', telefone: '(62) 3222-3333', email: 'objetivo@email.com', fonte: 'Site', lead_score: 70 },
  ];

  for (const c of clientesData) {
    await prisma.cliente.create({ data: c });
  }

  console.log('Semeando Turmas e Alunos...');
  const turmaA = await prisma.turma.create({ 
    data: { nome: '3º Ano A - Médio', ano: 2026, ano_letivo: 2026, periodo: 'matutino', curso: 'Ensino Médio' } 
  });

  await prisma.aluno.create({
    data: {
      nome: 'Henrique (Aluno V.I.P)',
      matricula: '20260001',
      idade: 25,
      email: 'henrique@inovar.app',
      telefone: '(62) 98888-0000',
      turma: turmaA.nome,
      curso: turmaA.curso,
      cidade: 'Goiânia',
      responsavel: 'Responsável Master',
      cpf_responsavel: '11023608138', // CPF REAL DO TESTE
      status: 'ativo'
    }
  });

  console.log('Semeando 2026/2027 Dashboard Data...');
  await prisma.evento.create({
    data: {
      nome: 'Formatura Eng. Civil 2026',
      tipo_evento: 'FORMATURA',
      status: 'CONFIRMADO',
      data_inicio: '2026-12-10',
      data_fim: '2026-12-10',
      horario_inicio: '19:00',
      horario_fim: '02:00',
      local_nome: 'Centro de Convenções',
      endereco_completo: 'Av. Paranaíba',
      cidade: 'Goiânia',
      estado: 'GO',
      capacidade_maxima: 500,
      vagas_disponiveis: 100,
      valor_total: 25000,
      cliente_nome: 'Turma Eng. Civil'
    }
  });

  console.log('Semeando Kanban Master...');
  const quadro = await prisma.quadro.create({
    data: { nome: 'Painel Geral Inovar', descricao: 'Gestão Inteligente' }
  });

  const coluna = await prisma.coluna.create({
    data: { nome: 'Backlog', ordem: 0, quadro_id: quadro.id }
  });

  await prisma.tarefa.create({
    data: {
      titulo: 'Finalizar Configuração CRM',
      descricao: 'Ajustar lead score e automação',
      responsavel_nome: 'Henrique',
      coluna_id: coluna.id,
      quadro_id: quadro.id,
      prioridade: 'alta'
    }
  });

  console.log('--- Super Seed 2026 Finalizado com Sucesso! ---');
}

main()
  .catch((e) => {
    console.error('Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
