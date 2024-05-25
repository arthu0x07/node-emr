import { Module } from '@nestjs/common'
import { PrismaService } from '@/database/prisma/prisma.service'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'

@Module({
  controllers: [CommentController],
  providers: [PrismaService, CommentService],
})
export class CommentModule {}
