import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '@/database/prisma/prisma.service'

@Injectable()
export class AnswerService {
  constructor(private prisma: PrismaService) {}

  async createAnswer(userId: string, questionId: string, content: string) {
    const questionExists = await this.prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!questionExists) {
      throw new NotFoundException(`Question with the provided ID not found`)
    }

    const createdAnswer = await this.prisma.answer.create({
      data: {
        content,
        questionId,
        authorID: userId,
      },
    })

    if (!createdAnswer) {
      throw new BadRequestException()
    }

    return createdAnswer
  }

  async editAnswer(answerId: string, userId: string, content: string) {
    if (!answerId) {
      throw new NotFoundException('Answer ID is required.')
    }

    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    })

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`)
    }

    if (answer.authorID !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to edit this answer`,
      )
    }

    const editedAnswer = await this.prisma.answer.update({
      where: { id: answerId },
      data: { content },
    })

    if (!editedAnswer) {
      throw new BadRequestException()
    }

    return editedAnswer
  }

  async selectBestAnswer(answerId: string, userId: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    })

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`)
    }

    const question = await this.prisma.question.findUnique({
      where: { id: answer.questionId },
    })

    if (!question || question.authorID !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to select the best answer for this question`,
      )
    }

    const updatedQuestion = await this.prisma.question.update({
      where: { id: answer.questionId },
      data: { bestAnwserId: answerId },
    })

    if (!updatedQuestion) {
      throw new BadRequestException(`Could not select best answer`)
    }
  }

  async getCommentsInAnswer(answerId: string, page: number) {
    const perPage = 10
    const skip = (page - 1) * perPage

    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    })

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`)
    }

    const comments = await this.prisma.comment.findMany({
      where: { answerId },
      take: perPage,
      skip,
      orderBy: { createdAt: 'desc' },
    })

    return comments
  }

  async deleteAnswer(answerId: string, userId: string): Promise<void> {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
    })

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`)
    }

    if (answer.authorID !== userId) {
      throw new UnauthorizedException(
        `You are not authorized to delete this answer`,
      )
    }

    const deletedAnswer = await this.prisma.answer.delete({
      where: { id: answerId },
    })

    if (!deletedAnswer) {
      throw new BadRequestException(
        `Failed to delete answer with ID ${answerId}`,
      )
    }
  }
}
