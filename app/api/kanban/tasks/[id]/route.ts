import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = rawId?.replace(/[\n\r\t]/g, "").trim();
    const body = await req.json();
    const {
      coluna_id,
      ordem,
      titulo,
      descricao,
      prioridade,
      responsavel_nome,
      responsavel_id,
      aluno_nome,
      aluno_cpf,
      aluno2_nome,
      aluno2_cpf,
      projeto_nome,
      instituicao
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Tentar atualizar como Tarefa
    try {
      const task = await prisma.tarefa.findUnique({ where: { id } });
      if (task) {
        const updated = await prisma.tarefa.update({
          where: { id },
          data: { 
            coluna_id: coluna_id || undefined,
            ordem: ordem !== undefined ? ordem : undefined,
            titulo: titulo || undefined,
            descricao: descricao !== undefined ? descricao : undefined,
            prioridade: prioridade || undefined,
            responsavel_nome: responsavel_nome !== undefined ? responsavel_nome : undefined,
          }
        });
        return NextResponse.json(updated);
      }
    } catch { }

    // Tentar atualizar como OS
    try {
      const os = await prisma.oS.findUnique({ 
        where: { id },
        include: { coluna: true }
      });
      
      if (os) {
        const targetCol = coluna_id ? await prisma.coluna.findUnique({ where: { id: coluna_id } }) : null;
        
        const updatedOS = await prisma.oS.update({
          where: { id },
          data: { 
            coluna_id: coluna_id || undefined,
            ordem: ordem !== undefined ? ordem : undefined,
            quadro_id: targetCol ? targetCol.quadro_id : undefined,
            // Normalizar status para contagem do dashboard
            status: targetCol ? targetCol.nome
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Remove acentos
              .replace(/\s+/g, '_') : undefined,
            nome: titulo || undefined, 
            descricao: descricao !== undefined ? descricao : undefined,
            responsavel_nome: responsavel_nome !== undefined ? responsavel_nome : undefined,
            responsavel_id: body.responsavel_id !== undefined ? body.responsavel_id : undefined,
            aluno_nome: aluno_nome !== undefined ? aluno_nome : undefined,
            aluno_cpf: aluno_cpf !== undefined ? aluno_cpf : undefined,
            aluno2_nome: body.aluno2_nome !== undefined ? body.aluno2_nome : undefined,
            aluno2_cpf: body.aluno2_cpf !== undefined ? body.aluno2_cpf : undefined,
            projeto_nome: projeto_nome !== undefined ? projeto_nome : undefined,
            instituicao: instituicao !== undefined ? instituicao : undefined,
          }
        });
        return NextResponse.json(updatedOS);
      }
    } catch (e) {
      console.error("Erro ao atualizar OS", e);
    }

    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = rawId?.replace(/[\n\r\t]/g, "").trim();

    // 1. Tentar arquivar como Tarefa
    try {
      await prisma.tarefa.update({ 
        where: { id },
        data: { arquivado: true }
      });
      return NextResponse.json({ success: true, archived: true });
    } catch { }

    // 2. Tentar arquivar como OS (Movendo para tabela OSArquivada)
    try {
      const os = await prisma.oS.findUnique({ where: { id } });
      if (os) {
        await prisma.$transaction([
          prisma.oSArquivada.create({
            data: {
              id: os.id,
              numero: os.numero,
              nome: os.nome,
              descricao: os.descricao,
              status: "arquivada",
              responsavel_nome: os.responsavel_nome,
              responsavel_id: os.responsavel_id,
              aluno_id: os.aluno_id,
              aluno_nome: os.aluno_nome,
              aluno_cpf: os.aluno_cpf,
              aluno2_id: os.aluno2_id,
              aluno2_nome: os.aluno2_nome,
              aluno2_cpf: os.aluno2_cpf,
              projeto_nome: os.projeto_nome,
              instituicao: os.instituicao,
              arquivado: true,
              ordem: os.ordem,
              coluna_id: os.coluna_id,
              quadro_id: os.quadro_id,
              created_at: os.created_at,
            }
          }),
          prisma.oS.delete({ where: { id } })
        ]);
        return NextResponse.json({ success: true, archived: true, moved: true });
      }
    } catch (e) { 
      console.error("Erro ao arquivar e mover OS", e);
    }

    return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar item' }, { status: 500 });
  }
}
