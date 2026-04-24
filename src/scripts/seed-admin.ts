import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "admin@bimilae.gov.br";
  const existe = await prisma.user.findUnique({ where: { email } });

  if (existe) {
    console.log("Usuário admin já existe.");
    return;
  }

  const senha = await bcrypt.hash("admin@2025", 10);
  await prisma.user.create({
    data: { nome: "Administrador", email, senha, role: "ADMIN", status: "ATIVO" },
  });

  console.log("✅ Usuário admin criado com sucesso!");
  console.log(`   E-mail: ${email}`);
  console.log("   Senha:  admin@2025");
}

main().finally(() => prisma.$disconnect());
