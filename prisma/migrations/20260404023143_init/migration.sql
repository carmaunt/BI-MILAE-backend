-- CreateEnum
CREATE TYPE "Faccao" AS ENUM ('BDM', 'CV', 'PCC', 'KLV', 'NAO_VINCULADO');

-- CreateTable
CREATE TABLE "milae" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milae_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agentes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "opm" TEXT NOT NULL,
    "vtr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milae_agentes" (
    "milaeId" INTEGER NOT NULL,
    "agenteId" INTEGER NOT NULL,

    CONSTRAINT "milae_agentes_pkey" PRIMARY KEY ("milaeId","agenteId")
);

-- CreateTable
CREATE TABLE "resistentes" (
    "id" SERIAL NOT NULL,
    "milaeId" INTEGER NOT NULL,
    "faccao" "Faccao" NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resistentes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agentes_matricula_key" ON "agentes"("matricula");

-- AddForeignKey
ALTER TABLE "milae_agentes" ADD CONSTRAINT "milae_agentes_milaeId_fkey" FOREIGN KEY ("milaeId") REFERENCES "milae"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milae_agentes" ADD CONSTRAINT "milae_agentes_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "agentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resistentes" ADD CONSTRAINT "resistentes_milaeId_fkey" FOREIGN KEY ("milaeId") REFERENCES "milae"("id") ON DELETE CASCADE ON UPDATE CASCADE;
