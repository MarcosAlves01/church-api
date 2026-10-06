/*
  Warnings:

  - The primary key for the `pessoas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `pessoas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `produtos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `produtos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `vendas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `vendas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `pessoa_id` on the `vendas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `produto_id` on the `vendas` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_pessoa_id_fkey";

-- DropForeignKey
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_produto_id_fkey";

-- AlterTable
ALTER TABLE "pessoas" DROP CONSTRAINT "pessoas_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "pessoas_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "produtos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "vendas" DROP CONSTRAINT "vendas_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "pessoa_id",
ADD COLUMN     "pessoa_id" INTEGER NOT NULL,
DROP COLUMN "produto_id",
ADD COLUMN     "produto_id" INTEGER NOT NULL,
ADD CONSTRAINT "vendas_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
