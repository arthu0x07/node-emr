import { Module } from '@nestjs/common'
import { PrismaService } from '@/database/prisma/prisma.service'
import { QuestionController } from './question.controller'
import { QuestionService } from './question.service'

@Module({
  controllers: [QuestionController],
  providers: [PrismaService, QuestionService],
})
export class QuestionModule {}
