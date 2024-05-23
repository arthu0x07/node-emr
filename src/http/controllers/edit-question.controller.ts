import {
  Controller,
  Post,
  UseGuards,
  Body,
  ConflictException,
  Param,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'

import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipes'
import { PrismaService } from '@/database/prisma/prisma.service'

const editQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
})

type EditQuestionBodySchema = z.infer<typeof editQuestionBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editQuestionBodySchema)

@Controller('/questions/:id')
@UseGuards(AuthGuard('jwt'))
export class EditQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe) body: EditQuestionBodySchema,
    @Param('id') questionId: string,
  ) {
    const { title, content, tags } = body
    const { slug } = this.convertToSlug(title)

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

    // Enable users to create questions with the same name but different slugs
    const slugExists = await this.prisma.question.findMany({
      where: {
        slug,
      },
      select: {
        title: true,
      },
    })
    const newSlug = `${slug}-${slugExists.length}`

    const updatedQuestion = await this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        title,
        content,
        slug: newSlug,
        tags: {
          connect: tags.map((tag) => ({ name: tag })),
        },
      },
      include: {
        tags: true,
      },
    })

    return { updatedQuestion }
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
