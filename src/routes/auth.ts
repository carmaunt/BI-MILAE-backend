import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/registrar", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
    return;
  }

  if (senha.length < 6) {
    res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
    return;
  }

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) {
    res.status(409).json({ error: "Já existe uma conta com esse e-mail." });
    return;
  }

  const hash = await bcrypt.hash(senha, 10);
  await prisma.user.create({
    data: { nome, email, senha: hash, role: "VISUALIZADOR", status: "PENDENTE" },
  });

  res.status(201).json({ message: "Solicitação enviada! Aguarde a aprovação do administrador para acessar o sistema." });
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ error: "Credenciais inválidas." });
    return;
  }

  if (user.status === "PENDENTE") {
    res.status(403).json({ error: "Sua conta está aguardando aprovação do administrador." });
    return;
  }

  if (user.status === "INATIVO") {
    res.status(403).json({ error: "Sua conta foi desativada. Entre em contato com o administrador." });
    return;
  }

  const senhaValida = await bcrypt.compare(senha, user.senha);
  if (!senhaValida) {
    res.status(401).json({ error: "Credenciais inválidas." });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.json({
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    },
  });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, nome: true, email: true, role: true, status: true },
  });

  if (!user || user.status !== "ATIVO") {
    res.status(401).json({ error: "Usuário não encontrado ou inativo." });
    return;
  }

  res.json(user);
});

router.get("/usuarios", requireAuth, async (req: AuthRequest, res) => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Apenas administradores podem listar usuários." });
    return;
  }

  const usuarios = await prisma.user.findMany({
    select: { id: true, nome: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(usuarios);
});

router.post("/usuarios", requireAuth, async (req: AuthRequest, res) => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Apenas administradores podem criar usuários." });
    return;
  }

  const { nome, email, senha, role } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
    return;
  }

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) {
    res.status(409).json({ error: "Já existe um usuário com esse e-mail." });
    return;
  }

  const hash = await bcrypt.hash(senha, 10);
  const user = await prisma.user.create({
    data: { nome, email, senha: hash, role: role ?? "VISUALIZADOR", status: "ATIVO" },
    select: { id: true, nome: true, email: true, role: true, status: true },
  });

  res.status(201).json(user);
});

router.patch("/usuarios/:id", requireAuth, async (req: AuthRequest, res) => {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({ error: "Apenas administradores podem editar usuários." });
    return;
  }

  const id = Number(req.params.id);
  const { nome, role, status, senha } = req.body;

  const data: Record<string, unknown> = {};
  if (nome !== undefined) data.nome = nome;
  if (role !== undefined) data.role = role;
  if (status !== undefined) data.status = status;
  if (senha) data.senha = await bcrypt.hash(senha, 10);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, nome: true, email: true, role: true, status: true },
  });

  res.json(user);
});

export default router;
