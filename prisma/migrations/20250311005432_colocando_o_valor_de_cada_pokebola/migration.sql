/*
  Warnings:

  - Added the required column `price` to the `Pokeball` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pokeball` ADD COLUMN `price` INTEGER NOT NULL;
