import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ alumnos: [], clientes: [], os: [] });
    }

    const [alumnos, clientes, os] = await Promise.all([
      // Search Alunos
      prisma.aluno.findMany({
        where: {
          OR: [
            { nome: { contains: query, mode: 'insensitive' } },
            { matricula: { contains: query, mode: 'insensitive' } },
            { cpf: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      // Search Clientes
      prisma.cliente.findMany({
        where: {
          OR: [
            { nome: { contains: query, mode: 'insensitive' } },
            { empresa: { contains: query, mode: 'insensitive' } },
            { telefone: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      // Search OS
      prisma.oS.findMany({
        where: {
          OR: [
            { nome: { contains: query, mode: 'insensitive' } },
            { numero: { contains: query, mode: 'insensitive' } },
            { aluno_nome: { contains: query, mode: 'insensitive' } },
          ],
          arquivado: false,
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({ alumnos, clientes, os }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro na busca' }, { status: 500 });
  }
}
