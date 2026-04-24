-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDENTE', 'ATIVO', 'INATIVO');

-- AlterTable: add status column with temporary default
ALTER TABLE "users" ADD COLUMN "status" "Status" NOT NULL DEFAULT 'PENDENTE';

-- Migrate existing data: ativo=true -> ATIVO, ativo=false -> INATIVO
UPDATE "users" SET "status" = 'ATIVO' WHERE "ativo" = true;
UPDATE "users" SET "status" = 'INATIVO' WHERE "ativo" = false;

-- Drop ativo column
ALTER TABLE "users" DROP COLUMN "ativo";
