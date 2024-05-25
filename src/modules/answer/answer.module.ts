import { Module } from '@nestjs/common'
import { AnswerService } from './answer.service'
import { AnswerController } from './answer.controller'
import { PrismaService } from '@/database/prisma/prisma.service'

@Module({
  providers: [AnswerService, PrismaService],
  controllers: [AnswerController],
})
export class AnswerModule {}
