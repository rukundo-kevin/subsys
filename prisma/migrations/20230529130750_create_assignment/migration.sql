/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `Lecturer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "TokenType" ADD VALUE 'ACTIVATION';

-- DropForeignKey
ALTER TABLE "Lecturer" DROP CONSTRAINT "Lecturer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- AlterTable
ALTER TABLE "Lecturer" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "lecturerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecturer" ADD CONSTRAINT "Lecturer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "Lecturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
