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
  const turmas = await Promise.all([
    prisma.turma.create({ data: { nome: '3º Ano A - Médio', ano: 2025, ano_letivo: 2025, periodo: 'matutino', curso: 'Ensino Médio', coordenador: 'Márcia Silva', sala: '101' } }),
    prisma.turma.create({ data: { nome: 'Direito - 10º Período', ano: 2025, ano_letivo: 2025, periodo: 'noturno', curso: 'Graduação', coordenador: 'Dr. Roberto', sala: 'Auditorio' } }),
  ]);

  console.log('Semeando Alunos...');
  for (let i = 0; i < 20; i++) {
    await prisma.aluno.create({
      data: {
        nome: `Aluno ${i + 1} de Teste`,
        matricula: `2025${String(i + 1).padStart(4, '0')}`,
        idade: 17 + (i % 5),
        email: `aluno${i + 1}@alu.inovar.app`,
        telefone: `(62) 98888-77${String(i).padStart(2, '0')}`,
        turma: turmas[i % turmas.length].nome,
        curso: turmas[i % turmas.length].curso,
        cidade: 'Goiânia',
        status: 'ativo'
      }
    });
  }

  console.log('Semeando Eventos Massivamente...');
  const eventosData = [
    { nome: 'Formatura Eng. Civil 2025', tipo: 'formatura', status: 'confirmado', data: '2025-12-10', valor: 25000 },
    { nome: 'Casamento Aline & João', tipo: 'casamento', status: 'pendente', data: '2025-05-15', valor: 18000 },
    { nome: 'Curso Dashboards IA', tipo: 'curso', status: 'confirmado', data: '2025-04-20', valor: 5000 },
    { nome: 'Palestra Transformação Digital', tipo: 'palestra', status: 'concluido', data: '2024-11-10', valor: 3500 },
    { nome: 'Workshop Agile Coaching', tipo: 'workshop', status: 'pendente', data: '2025-06-05', valor: 8500 },
    { nome: 'Aniversário 15 anos Sofia', tipo: 'aniversario', status: 'confirmado', data: '2025-01-12', valor: 12500 },
  ];

  for (const ev of eventosData) {
    await prisma.evento.create({
      data: {
        nome: ev.nome,
        tipo_evento: ev.tipo,
        status: ev.status,
        data_inicio: ev.data,
        data_fim: ev.data,
        horario_inicio: '19:00',
        horario_fim: '02:00',
        local_nome: 'Espaço Inovar Festas',
        endereco_completo: 'Endereço de Exemplo',
        cidade: 'Goiânia',
        estado: 'GO',
        capacidade_maxima: 200,
        vagas_disponiveis: 50,
        valor_total: ev.valor,
        valor_entrada: ev.valor * 0.3,
        valor_pendente: ev.valor * 0.7,
        cliente_nome: 'Cliente Exemplo',
        checklist: JSON.stringify([
          { item: 'Contratar Equipe', feito: ev.status === 'concluido' },
          { item: 'Reservar Local', feito: true }
        ])
      }
    });
  }

  console.log('Semeando Quadro e Kanban...');
  await prisma.quadro.create({
    data: {
      nome: 'Painel de Operações Inovar',
      descricao: 'Controle de fluxo de eventos e tarefas administrativas',
      colunas: {
        create: [
          {
            nome: 'Backlog',
            ordem: 0,
            tarefas: {
              create: [
                { titulo: 'Configurar Servidor Easypanel', descricao: 'Ajustar variáveis de ambiente do Postgres', prioridade: 'urgente', responsavel_nome: 'Henrique', ordem: 0, etiquetas: 'Servidor,DevOps' },
                { titulo: 'Revisar Contratos SESI', descricao: 'Verificar cláusulas de rescisão', prioridade: 'alta', responsavel_nome: 'IA', ordem: 1, etiquetas: 'Jurídico' },
              ]
            }
          },
          {
            nome: 'Em Andamento',
            ordem: 1,
            tarefas: {
              create: [
                { titulo: 'Implementar Dashboard IA', descricao: 'Criar gráficos de tendência de eventos', prioridade: 'media', responsavel_nome: 'Admin', ordem: 0, etiquetas: 'Feature' },
              ]
            }
          },
          {
            nome: 'Concluído',
            ordem: 2,
            tarefas: {
              create: [
                { titulo: 'Instalar n8n local', descricao: 'Workflow de entrada de alunos ok', prioridade: 'baixa', responsavel_nome: 'Henrique', ordem: 0, etiquetas: 'Integração' },
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
