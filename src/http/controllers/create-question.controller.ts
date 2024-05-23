import {
  Controller,
  Post,
  UseGuards,
  Body,
  ConflictException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'

import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipes'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt-strategy'
import { PrismaService } from '@/database/prisma/prisma.service'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)

@Controller('/questions')
@UseGuards(AuthGuard('jwt'))
export class CreateQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe)
    body: CreateQuestionBodySchema,
  ) {
    const userId = user.sub

    const { title, content, tags } = body
    const { slug } = this.convertToSlug(title)

    const slugExists = await this.prisma.question.findUnique({
      where: {
        slug,
      },
    })

    if (slugExists) {
      throw new ConflictException('Question already exists in the database.')
    }

    const existingTags = await this.prisma.tag.findMany({
      where: {
        name: {
          in: tags,
        },
      },
    })

    if (existingTags.length !== tags.length) {
      const nonExistingTags = tags.filter(
        (tag) => !existingTags.some((existingTag) => existingTag.name === tag),
      )
      throw new ConflictException(
        `invalid tag(s) provided: ${nonExistingTags.join(', ')}`,
      )
    }

    const createdQuestion = await this.prisma.question.create({
      data: {
        authorID: userId,
        title,
        content,
        slug,
        tags: {
          connect: existingTags.map((tag) => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    })

    return createdQuestion
  }

  // used to create a better slug with no accents and white spaces
  private convertToSlug(title: string): { slug: string } {
    return {
      slug: title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-'),
    }
  }
}
