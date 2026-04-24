import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const milae = await prisma.milae.findMany({
    include: {
      agentes: {
        include: {
          agente: true,
        },
      },
      resistentes: true,
    },
  });

  const result = milae.map((m) => ({
    id: m.id,
    data: m.data.toISOString().slice(0, 10),
    hora: m.hora,
    local: m.local,
    lat: m.lat,
    lng: m.lng,
    agentes: m.agentes.map((a) => ({
      nome: a.agente.nome,
      matricula: a.agente.matricula,
      opm: a.agente.opm,
      vtr: a.agente.vtr ?? undefined,
    })),
    resistentes: m.resistentes.map((r) => ({
      faccao: r.faccao === "NAO_VINCULADO" ? "NÃO VINCULADO" : r.faccao,
      lat: r.lat,
      lng: r.lng,
    })),
  }));

  res.json(result);
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { data, hora, local, lat, lng, agentes = [], resistentes = [] } = req.body;

    const agentesCriados = await Promise.all(
      agentes.map(async (a: { nome?: string; matricula?: string; opm?: string }) => {
        const nome = (a.nome ?? "").trim();
        const matricula = (a.matricula ?? "").trim();
        const opm = (a.opm ?? "").trim();

        const agenteExistente = await prisma.agente.findUnique({
          where: { matricula },
        });

        if (agenteExistente) {
          return prisma.agente.update({
            where: { id: agenteExistente.id },
            data: { nome, opm },
          });
        }

        return prisma.agente.create({
          data: { nome, matricula, opm },
        });
      })
    );

    const milae = await prisma.milae.create({
      data: {
        data: new Date(data),
        hora,
        local,
        lat,
        lng,
        agentes: {
          create: agentesCriados.map((agente) => ({
            agente: {
              connect: { id: agente.id },
            },
          })),
        },
        resistentes: {
          create: resistentes.map(
            (r: { nome?: string; idade?: number; faccao?: string | null }) => ({
              nome: r.nome?.trim() || null,
              idade: r.idade ?? null,
              faccao:
                r.faccao === "NÃO VINCULADO"
                  ? "NAO_VINCULADO"
                  : (r.faccao ?? "NAO_VINCULADO"),
              lat,
              lng,
            })
          ),
        },
      },
    });

    res.status(201).json(milae);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar MILAE." });
  }
});

export default router;
