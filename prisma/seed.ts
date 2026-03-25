import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco de dados (SQLite mode)...');
  await prisma.eventoAluno.deleteMany();
  await prisma.participante.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.fAQ.deleteMany();

  console.log('Semeando Clientes...');
  const clientes = await Promise.all([
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
  for (let i = 0; i < 40; i++) {
    const nome = `Aluno ${i + 1} de Teste`;
    const matricula = `2025${String(i + 1).padStart(4, '0')}`;
    const email = `aluno${i + 1}@alu.inovar.app`;
    const turma = turmas[i % turmas.length];

    await prisma.aluno.create({
      data: {
        nome,
        matricula,
        idade: 17 + (i % 5),
        email,
        telefone: `(62) 98888-77${String(i).padStart(2, '0')}`,
        turma: turma.nome,
        curso: turma.curso,
        cidade: 'Goiânia',
        status: 'ativo'
      }
    });
  }

  console.log('Semeando Eventos...');
  const evento = await prisma.evento.create({
    data: {
      nome: 'Formatura Eng. Civil 2025',
      tipo_evento: 'formatura',
      status: 'confirmado',
      data_inicio: '2025-12-10',
      data_fim: '2025-12-11',
      horario_inicio: '19:00',
      horario_fim: '03:00',
      local_nome: 'Espaço Inovar Festas',
      endereco_completo: 'Av. T-63, Setor Bueno',
      cidade: 'Goiânia',
      estado: 'GO',
      capacidade_maxima: 500,
      vagas_disponiveis: 120,
      valor_total: 25000,
      valor_entrada: 7500,
      valor_pendente: 17500,
      cliente_nome: 'Faculdade Alfa',
      checklist: JSON.stringify([
          { item: 'Contratar Buffet', feito: true },
          { item: 'Definir Playlist', feito: false }
      ])
    }
  });

  console.log('Semeando FAQs...');
  await prisma.fAQ.createMany({
    data: [
      { categoria: 'Financeiro', pergunta: 'Como solicitar reembolso?', resposta: 'Via formulário oficial.', palavras_chave: 'reembolso, devolução', ordem: 1 },
      { categoria: 'Eventos', pergunta: 'Checklist?', resposta: 'Acesse o menu Eventos.', palavras_chave: 'checklist, lista', ordem: 3 },
    ]
  });

  console.log('Seed do banco de dados concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
