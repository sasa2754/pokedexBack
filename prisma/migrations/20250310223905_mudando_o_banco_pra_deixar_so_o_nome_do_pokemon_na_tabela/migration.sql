/*
  Warnings:

  - You are about to drop the column `pokemonId` on the `pokedex` table. All the data in the column will be lost.
  - Added the required column `pokemonName` to the `Pokedex` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `pokedex` DROP FOREIGN KEY `Pokedex_pokemonId_fkey`;

-- DropIndex
DROP INDEX `Pokedex_pokemonId_fkey` ON `pokedex`;

-- AlterTable
ALTER TABLE `pokedex` DROP COLUMN `pokemonId`,
    ADD COLUMN `pokemonName` VARCHAR(191) NOT NULL;
