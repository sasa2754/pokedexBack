/*
  Warnings:

  - Added the required column `imageBack` to the `Pokemon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageBackShiny` to the `Pokemon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pokemon` ADD COLUMN `imageBack` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageBackShiny` VARCHAR(191) NOT NULL;
