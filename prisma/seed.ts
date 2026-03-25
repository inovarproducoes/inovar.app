import { PrismaClient, TipoEvento, StatusEvento, StatusParticipacao, StatusAluno, TipoParticipante, StatusParticipante, Periodo, StatusTurma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco de dados...');
  await prisma.eventoAluno.deleteMany();
  await prisma.participante.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.fAQ.deleteMany();

  console.log('Semeando Clientes...');
  const clientes = await Promise.all([
    prisma.cliente.create({ data: { nome: 'SESI Goiânia', telefone: '(62) 3222-1111', documento: '01.234.567/0001-89' } }),
    prisma.cliente.create({ data: { nome: 'Escola Adventista', telefone: '(62) 3222-2222', documento: '02.234.567/0001-90' } }),
    prisma.cliente.create({ data: { nome: 'Colégio Objetivo', telefone: '(62) 3222-3333', documento: '03.234.567/0001-91' } }),
    prisma.cliente.create({ data: { nome: 'Faculdade Alfa', telefone: '(62) 3222-4444', documento: '04.234.567/0001-92' } }),
    prisma.cliente.create({ data: { nome: 'Prefeitura de Aparecida', telefone: '(62) 3222-5555', documento: '05.234.567/0001-93' } }),
    prisma.cliente.create({ data: { nome: 'Grupo Porto Seguro', telefone: '(62) 3222-6666', documento: '06.234.567/0001-94' } }),
    prisma.cliente.create({ data: { nome: 'Unimed Goiânia', telefone: '(62) 3222-7777', documento: '07.234.567/0001-95' } }),
    prisma.cliente.create({ data: { nome: 'Ricardo Eletro Eventos', telefone: '(62) 3222-8888', documento: '08.234.567/0001-96' } }),
    prisma.cliente.create({ data: { nome: 'Sebrae GO', telefone: '(62) 3222-9999', documento: '09.234.567/0001-97' } }),
    prisma.cliente.create({ data: { nome: 'Fernando Pessoa (Individual)', telefone: '(62) 99999-1111', documento: '123.456.789-00' } }),
  ]);

  console.log('Semeando Turmas...');
  const turmas = await Promise.all([
    prisma.turma.create({ data: { nome: '3º Ano A - Médio', ano: 2025, ano_letivo: 2025, periodo: 'matutino', curso: 'Ensino Médio', coordenador: 'Márcia Silva', sala: '101' } }),
    prisma.turma.create({ data: { nome: '3º Ano B - Médio', ano: 2025, ano_letivo: 2025, periodo: 'vespertino', curso: 'Ensino Médio', coordenador: 'Ricardo Souza', sala: '102' } }),
    prisma.turma.create({ data: { nome: '9º Ano - Fundamental', ano: 2025, ano_letivo: 2025, periodo: 'matutino', curso: 'Ensino Fundamental', coordenador: 'Ana Paula', sala: '201' } }),
    prisma.turma.create({ data: { nome: 'Direito - 10º Período', ano: 2025, ano_letivo: 2025, periodo: 'noturno', curso: 'Graduação', coordenador: 'Dr. Roberto', sala: 'Auditorio' } }),
    prisma.turma.create({ data: { nome: 'Administração - Noturno', ano: 2025, ano_letivo: 2025, periodo: 'noturno', curso: 'Graduação', coordenador: 'Carla Dias', sala: '305' } }),
  ]);

  console.log('Semeando Alunos...');
  const nomes = ['Lucas', 'Mariana', 'Pedro', 'Julia', 'Gabriel', 'Beatriz', 'Arthur', 'Sophia', 'Enzo', 'Valentina', 'Rafael', 'Alice', 'Matheus', 'Heloisa', 'Gustavo', 'Lorena', 'Felipe', 'Manuela', 'Samuel', 'Isabella'];
  const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];

  const alunosCriados = [];
  for (let i = 0; i < 40; i++) {
    const nome = `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`;
    const matricula = `2025${String(i + 1).padStart(4, '0')}`;
    const email = `${nome.split(' ')[0].toLowerCase()}.${matricula}@alu.inovar.app`;
    const turma = turmas[Math.floor(Math.random() * turmas.length)];

    const aluno = await prisma.aluno.create({
      data: {
        nome,
        matricula,
        idade: 17 + Math.floor(Math.random() * 5),
        email,
        telefone: `(62) 9${Math.floor(Math.random() * 90000000 + 10000000)}`,
        turma: turma.nome,
        curso: turma.curso,
        cidade: 'Goiânia',
        status: 'ativo',
        responsavel: `${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]} Senior`,
      }
    });
    alunosCriados.push(aluno);
  }

  console.log('Semeando Eventos...');
  const eventosData = [
    { nome: 'Formatura Eng. Civil 2025', tipo: 'formatura', status: 'confirmado', valor: 25000 },
    { nome: 'Workshop Inovação Tech', tipo: 'workshop', status: 'em_andamento', valor: 5000 },
    { nome: 'Casamento Aline & Marcos', tipo: 'casamento', status: 'confirmado', valor: 45000 },
    { nome: 'Convenção Nacional de Vendas', tipo: 'corporativo', status: 'planejamento', valor: 120000 },
    { nome: 'Baile de Máscaras Objetivo', tipo: 'festa', status: 'confirmado', valor: 15000 },
    { nome: 'Formatura 3º Ano Sesi', tipo: 'formatura', status: 'confirmado', valor: 30000 },
    { nome: 'Conferência Anual Medicina', tipo: 'conferencia', status: 'planejamento', valor: 60000 },
    { nome: 'Aniversário 50 Anos Porto', tipo: 'aniversario', status: 'finalizado', valor: 18000 },
    { nome: 'Lançamento Novo App', tipo: 'corporativo', status: 'finalizado', valor: 8000 },
    { nome: 'Festa Junina Inovar', tipo: 'festa', status: 'confirmado', valor: 12000 },
  ];

  const eventosCriados = [];
  for (const ev of eventosData) {
    const evento = await prisma.evento.create({
      data: {
        nome: ev.nome,
        tipo_evento: ev.tipo as TipoEvento,
        status: ev.status as StatusEvento,
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
        valor_total: ev.valor,
        valor_entrada: ev.valor * 0.3,
        valor_pendente: ev.valor * 0.7,
        cliente_nome: clientes[Math.floor(Math.random() * clientes.length)].nome,
        checklist: [
          { item: 'Contratar Buffet', feito: true },
          { item: 'Definir Playlist', feito: false },
          { item: 'Enviar Convites', feito: true },
          { item: 'Contratar Segurança', feito: false }
        ]
      }
    });
    eventosCriados.push(evento);
  }

  console.log('Vinculando Alunos aos Eventos de Formatura...');
  const formaturas = eventosCriados.filter(e => e.tipo_evento === 'formatura');
  for (const form of formaturas) {
    const subsetAlunos = alunosCriados.slice(0, 15);
    for (const aluno of subsetAlunos) {
      await prisma.eventoAluno.create({
        data: {
          evento_id: form.id,
          aluno_id: aluno.id,
          status_participacao: 'confirmado',
          acompanhantes: 2,
          confirma_presenca: true,
          funcao: 'formando'
        }
      });
    }
  }

  console.log('Semeando Participantes (Convidados)...');
  const workshops = eventosCriados.filter(e => e.tipo_evento === 'workshop');
  for (const work of workshops) {
    for (let i = 0; i < 10; i++) {
        await prisma.participante.create({
            data: {
                evento_id: work.id,
                nome: `Visitante ${i + 1}`,
                email: `visitante${i}@exemplo.com`,
                status_confirmacao: 'confirmado',
                tipo_participante: 'comum'
            }
        });
    }
  }

  console.log('Semeando FAQs...');
  await prisma.fAQ.createMany({
    data: [
      { categoria: 'Financeiro', pergunta: 'Como solicitar reembolso?', resposta: 'Você deve abrir um chamado no financeiro via formulário oficial no site.', palavras_chave: ['reembolso', 'devolução', 'dinheiro'], ordem: 1 },
      { categoria: 'Financeiro', pergunta: 'Quais formas de pagamento?', resposta: 'Aceitamos PIX, Boleto e Cartão de Crédito em até 12x.', palavras_chave: ['pagamento', 'pix', 'cartão'], ordem: 2 },
      { categoria: 'Eventos', pergunta: 'Como vejo o checklist do meu evento?', resposta: 'Acesse o menu Eventos, selecione seu evento e procure a aba "Checklist".', palavras_chave: ['checklist', 'lista', 'tarefas'], ordem: 3 },
      { categoria: 'Sophia IA', pergunta: 'O que a Sophia pode fazer?', resposta: 'A Sophia pode consultar dados financeiros, listar alunos e responder dúvidas frequentes.', palavras_chave: ['sophia', 'ia', 'ajuda'], ordem: 4 },
      { categoria: 'Administrativo', pergunta: 'Como alterar meus dados?', resposta: 'Entre em contato com a secretaria no telefone (62) 3222-0000.', palavras_chave: ['perfil', 'alterar', 'dados'], ordem: 5 },
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
