import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '@/database/prisma/prisma.service'

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async getRecentQuestions(page: number) {
    const perPage = 5

    const questions = await this.prisma.question.findMany({
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return questions
  }

  async getQuestionBySlug(slug: string) {
    const question = await this.prisma.question.findUnique({
      where: { slug },
      include: {
        tags: {
          select: {
            name: true,
          },
        },
      },
    })

    return question
  }

  async getQuestionById(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    })

    return question
  }

  async getQuestionAnswers(questionId: string) {
    const answers = await this.prisma.answer.findMany({
      where: { questionId },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return answers
  }

  async getQuestionComments(questionId: string, page: number) {
    const perPage = 10

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`)
    }

    const comments = await this.prisma.comment.findMany({
      where: { questionId },
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { createdAt: 'desc' },
    })

    return comments
  }

  async createQuestion(
    userId: string,
    title: string,
    content: string,
    tags: string[],
    attachmentsIds: string[],
  ) {
    await this.validateTags(tags)
    const slug = await this.generateUniqueSlug(title)

    const createdQuestion = await this.prisma.question.create({
      data: {
        authorID: userId,
        title,
        content,
        slug,
        tags: {
          connect: tags.map((tag) => ({ name: tag })),
        },
        attachments: {
          connect: attachmentsIds.map((attachmentId) => ({ id: attachmentId })),
        },
      },
      include: {
        attachments: true,
        tags: true,
      },
    })

    return createdQuestion
  }

  async editQuestion(
    questionId: string,
    userId: string,
    title: string,
    content: string,
    tags: string[],
    attachmentsIds: string[],
  ) {
    await this.validateTags(tags)
    const slug = await this.generateUniqueSlug(title)

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      throw new NotFoundException('Question with the provided id not found')
    }

    if (question.authorID !== userId) {
      throw new UnauthorizedException()
    }

    const updatedQuestion = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        title,
        content,
        slug,
        tags: {
          connect: tags.map((tag) => ({ name: tag })),
        },
        attachments: {
          connect: attachmentsIds.map((attachmentId) => ({ id: attachmentId })),
        },
      },
      include: {
        attachments: true,
        tags: true,
      },
    })

    return updatedQuestion
  }

  async deleteQuestion(questionId: string, userId: string): Promise<void> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    })

    if (!question) {
      throw new NotFoundException('Question with the provided ID not found')
    }

    if (question.authorID !== userId) {
      throw new UnauthorizedException()
    }

    await this.prisma.question.delete({
      where: { id: questionId },
    })
  }

  async validateTags(tags: string[]): Promise<void> {
    const existingTags = await this.prisma.tag.findMany({
      where: { name: { in: tags } },
    })

    if (existingTags.length !== tags.length) {
      const nonExistingTags = tags.filter(
        (tag) => !existingTags.some((existingTag) => existingTag.name === tag),
      )
      throw new ConflictException(
        `invalid tag(s) provided: ${nonExistingTags.join(', ')}`,
      )
    }
  }

  async generateUniqueSlug(title: string): Promise<string> {
    const slug = this.convertToSlug(title)

    const titleExists = await this.prisma.question.findMany({
      where: { title },
      select: { title: true },
    })

    return `${slug}-${titleExists.length}`
  }

  convertToSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }
}
