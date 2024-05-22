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

    const { title, content } = body
    const { slug } = this.convertToSlug(title)

    const slugExists = await this.prisma.question.findUnique({
      where: {
        slug,
      },
    })

    if (slugExists) {
      throw new ConflictException('user email exits on database.')
    }

    await this.prisma.question.create({
      data: {
        authorID: userId,
        title,
        content,
        slug,
      },
    })
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
