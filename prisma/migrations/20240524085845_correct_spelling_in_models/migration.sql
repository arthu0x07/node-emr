/*
  Warnings:

  - You are about to drop the column `anwser_id` on the `attachments` table. All the data in the column will be lost.
  - You are about to drop the column `anwser_id` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `best_awnser_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the `awnsers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[best_answer_id]` on the table `questions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "attachments" DROP CONSTRAINT "attachments_anwser_id_fkey";

-- DropForeignKey
ALTER TABLE "awnsers" DROP CONSTRAINT "awnsers_author_id_fkey";

-- DropForeignKey
ALTER TABLE "awnsers" DROP CONSTRAINT "awnsers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_anwser_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_best_awnser_id_fkey";

-- DropIndex
DROP INDEX "questions_best_awnser_id_key";

-- AlterTable
ALTER TABLE "attachments" DROP COLUMN "anwser_id",
ADD COLUMN     "answer_id" TEXT;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "anwser_id",
ADD COLUMN     "answer_id" TEXT;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "best_awnser_id",
ADD COLUMN     "best_answer_id" TEXT;

-- DropTable
DROP TABLE "awnsers";

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "author_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_best_answer_id_key" ON "questions"("best_answer_id");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_best_answer_id_fkey" FOREIGN KEY ("best_answer_id") REFERENCES "answer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "answer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "answer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
