/**
 * Script para criar o usuário administrador Inovar.app
 * com a senha histórica "inovar2025" migrada para hash bcrypt.
 *
 * Execução: npx tsx scripts/criar-usuario-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@inovar.app";
  const senhaOriginal = "inovar2025"; // Senha histórica migrada
  const nome = "Inovar App";

  console.log("🔐 Iniciando migração do usuário administrador...\n");

  // Verifica se já existe
  const existente = await prisma.usuario.findUnique({ where: { email } });

  if (existente) {
    console.log(`✅ Usuário "${email}" já existe. Nenhuma alteração feita.`);
    console.log(`   ID: ${existente.id}`);
    console.log(`   Nome: ${existente.nome}`);
    console.log(`   Role: ${existente.role}`);
    return;
  }

  // Hash da senha
  console.log("⚙️  Gerando hash da senha...");
  const senhaHash = await bcrypt.hash(senhaOriginal, 12);

  // Cria o usuário admin
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha_hash: senhaHash,
      role: "admin",
      ativo: true,
    },
  });

  console.log("\n✅ Usuário administrador criado com sucesso!\n");
  console.log("─────────────────────────────────────────");
  console.log(`   ID:    ${usuario.id}`);
  console.log(`   Nome:  ${usuario.nome}`);
  console.log(`   Email: ${usuario.email}`);
  console.log(`   Role:  ${usuario.role}`);
  console.log("─────────────────────────────────────────");
  console.log("\n📋 Credenciais de acesso:");
  console.log(`   E-mail: ${email}`);
  console.log(`   Senha:  ${senhaOriginal}`);
  console.log("\n⚠️  Recomendamos alterar a senha após o primeiro acesso.\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante a migração:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
