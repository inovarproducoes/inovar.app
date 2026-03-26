import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  console.log('Semeando Clientes...');
  await Promise.all([
    prisma.cliente.create({ data: { nome: 'SESI Goiânia', telefone: '(62) 3222-1111' } }),
    prisma.cliente.create({ data: { nome: 'Escola Adventista', telefone: '(62) 3222-2222' } }),
    prisma.cliente.create({ data: { nome: 'Colégio Objetivo', telefone: '(62) 3222-3333' } }),
    prisma.cliente.create({ data: { nome: 'Faculdade Alfa', telefone: '(62) 3222-4444' } }),
    prisma.cliente.create({ data: { nome: 'Prefeitura de Aparecida', telefone: '(62) 3222-5555' } }),
  ]);

  console.log('Semeando Turmas...');
  const turmasData = await Promise.all([
    prisma.turma.create({ data: { nome: '3º Ano A - Médio', ano: 2026, ano_letivo: 2026, periodo: 'matutino', curso: 'Ensino Médio', coordenador: 'Márcia Silva', sala: '101' } }),
    prisma.turma.create({ data: { nome: 'Direito - 10º Período', ano: 2026, ano_letivo: 2026, periodo: 'noturno', curso: 'Graduação', coordenador: 'Dr. Roberto', sala: 'Auditorio' } }),
  ]);

  console.log('Semeando Alunos...');
  for (let i = 0; i < 20; i++) {
    await prisma.aluno.create({
      data: {
        nome: `Aluno ${i + 1} de Teste`,
        matricula: `2026${String(i + 1).padStart(4, '0')}`,
        idade: 17 + (i % 5),
        email: `aluno${i + 1}@alu.inovar.app`,
        telefone: `(62) 98888-77${String(i).padStart(2, '0')}`,
        turma: turmasData[i % turmasData.length].nome,
        curso: turmasData[i % turmasData.length].curso,
        cidade: 'Goiânia',
        status: 'ativo'
      }
    });
  }

  console.log('Semeando 15 Eventos para 2026/2027...');
  const eventosComplexos = [
    { nome: 'Formatura Eng. Civil 2026', tipo: 'formatura', status: 'confirmado', data: '2026-12-10', valor: 25000 },
    { nome: 'Casamento Aline & João', tipo: 'casamento', status: 'pendente', data: '2026-05-15', valor: 35000 },
    { nome: 'Curso Dashboards IA', tipo: 'curso', status: 'confirmado', data: '2026-04-20', valor: 5500 },
    { nome: 'Palestra Transformação Digital', tipo: 'palestra', status: 'concluido', data: '2026-03-10', valor: 4200 },
    { nome: 'Show Aniversário da Cidade', tipo: 'show', status: 'confirmado', data: '2026-10-24', valor: 150000 },
    { nome: 'Workshop Liderança Ágil', tipo: 'workshop', status: 'confirmado', data: '2026-06-12', valor: 12000 },
    { nome: 'Aniversário 15 anos Sofia', tipo: 'aniversario', status: 'confirmado', data: '2026-03-25', valor: 15500 },
    { nome: 'Seminário Direito Público', tipo: 'seminario', status: 'pendente', data: '2026-08-05', valor: 3200 },
    { nome: 'Congresso Tecnologia 2026', tipo: 'outro', status: 'confirmado', data: '2026-09-15', valor: 85000 },
    { nome: 'Jantar Beneficente APAE', tipo: 'jantar', status: 'confirmado', data: '2026-03-22', valor: 9000 },
    { nome: 'Lançamento Imobiliário Portal', tipo: 'palestra', status: 'pendente', data: '2026-04-14', valor: 11000 },
    { nome: 'Treinamento Equipe Vendas', tipo: 'workshop', status: 'concluido', data: '2026-03-05', valor: 2500 },
    { nome: 'Feira Regional de Negócios', tipo: 'outro', status: 'confirmado', data: '2026-07-18', valor: 45000 },
    { nome: 'Baile de Máscaras 2026', tipo: 'show', status: 'confirmado', data: '2026-11-30', valor: 32000 },
    { nome: 'Curso Extensão Nutrição', tipo: 'curso', status: 'pendente', data: '2027-02-02', valor: 1500 },
  ];

  for (const ev of eventosComplexos) {
    await prisma.evento.create({
      data: {
        nome: ev.nome,
        tipo_evento: ev.tipo,
        status: ev.status,
        data_inicio: ev.data,
        data_fim: ev.data,
        horario_inicio: '19:00',
        horario_fim: '02:00',
        local_nome: 'Centro de Convenções Goiânia',
        endereco_completo: 'Av. Paranaíba, Setor Central',
        cidade: 'Goiânia',
        estado: 'GO',
        capacidade_maxima: 500,
        vagas_disponiveis: 100,
        valor_total: ev.valor,
        valor_entrada: ev.valor * 0.3,
        valor_pendente: ev.valor * 0.7,
        cliente_nome: 'Master Eventos Ltda',
        checklist: JSON.stringify([
          { item: 'Contratar Equipe', feito: ev.status === 'concluido' },
          { item: 'Reservar Local', feito: true },
          { item: 'Definir Buffet', feito: false }
        ])
      }
    });
  }

  console.log('Semeando Quadro e Kanban...');
  const quadro = await prisma.quadro.create({
    data: {
      nome: 'Painel de Operações Inovar',
      descricao: 'Controle mestre de fluxo de eventos',
    }
  });

  const colunas = await Promise.all([
    prisma.coluna.create({ data: { nome: 'Backlog', ordem: 0, quadro_id: quadro.id } }),
    prisma.coluna.create({ data: { nome: 'Em Andamento', ordem: 1, quadro_id: quadro.id } }),
    prisma.coluna.create({ data: { nome: 'Concluído', ordem: 2, quadro_id: quadro.id } }),
  ]);

  console.log('Semeando Tarefas Reais...');
  await prisma.tarefa.createMany({
    data: [
      { titulo: 'Configurar Easypanel Pro', descricao: 'Ajustar containers e SSL', prioridade: 'urgente', responsavel_nome: 'Henrique', ordem: 0, etiquetas: 'Servidor,Prod', coluna_id: colunas[0].id, quadro_id: quadro.id },
      { titulo: 'Revisar Contratos SESI', descricao: 'Ajustar prazo de pagamento', prioridade: 'alta', responsavel_nome: 'IA', ordem: 1, etiquetas: 'Financeiro', coluna_id: colunas[0].id, quadro_id: quadro.id },
      { titulo: 'Design Dashboard IA', descricao: 'Ajustar gráficos de pizza', prioridade: 'media', responsavel_nome: 'Admin', ordem: 0, etiquetas: 'UI/UX', coluna_id: colunas[1].id, quadro_id: quadro.id },
      { titulo: 'Instalação n8n finalizada', descricao: 'Workflows de e-mail ok', prioridade: 'baixa', responsavel_nome: 'Henrique', ordem: 0, etiquetas: 'Automação', coluna_id: colunas[2].id, quadro_id: quadro.id },
      { titulo: 'Treinamento de Equipe', descricao: 'Apresentação do sistema Inovar', prioridade: 'baixa', responsavel_nome: 'Márcia', ordem: 1, etiquetas: 'RH', coluna_id: colunas[2].id, quadro_id: quadro.id },
    ]
  });

  console.log('Seed de 2026 concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
