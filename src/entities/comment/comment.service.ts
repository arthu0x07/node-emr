import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '@/database/prisma/prisma.service'

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async createCommentInAnswer(
    answerId: string,
    userId: string,
    content: string,
  ) {
    const answer = await this.prismaService.answer.findUnique({
      where: { id: answerId },
    })

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`)
    }

    const createdComment = await this.prismaService.comment.create({
      data: {
        answerId,
        content,
        authorId: userId,
      },
    })

    return createdComment
  }

  async deleteCommentInAnswer(
    commentId: string,
    userId: string,
  ): Promise<void> {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`)
    }

    if (comment.authorId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to delete this comment`,
      )
    }

    await this.prismaService.comment.delete({
      where: { id: commentId },
    })
  }

  async createCommentInQuestion(
    questionId: string,
    userId: string,
    content: string,
  ) {
    const question = await this.prismaService.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`)
    }

    const createdComment = await this.prismaService.comment.create({
      data: {
        questionId,
        content,
        authorId: userId,
      },
    })

    return createdComment
  }

  async deleteCommentInQuestion(
    commentId: string,
    userId: string,
  ): Promise<void> {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`)
    }

    if (comment.authorId !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to delete this comment`,
      )
    }

    await this.prismaService.comment.delete({
      where: { id: commentId },
    })
  }
}
