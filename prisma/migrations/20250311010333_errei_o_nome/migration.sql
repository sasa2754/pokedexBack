/*
  Warnings:

  - You are about to drop the column `amout` on the `userpokeball` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `userpokeball` DROP COLUMN `amout`,
    ADD COLUMN `amount` INTEGER NOT NULL DEFAULT 0;
