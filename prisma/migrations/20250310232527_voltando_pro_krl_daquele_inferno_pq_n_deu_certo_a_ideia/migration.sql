/*
  Warnings:

  - You are about to drop the column `pokemonName` on the `pokedex` table. All the data in the column will be lost.
  - Added the required column `pokemonId` to the `Pokedex` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pokedex` DROP COLUMN `pokemonName`,
    ADD COLUMN `pokemonId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Pokedex` ADD CONSTRAINT `Pokedex_pokemonId_fkey` FOREIGN KEY (`pokemonId`) REFERENCES `Pokemon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
