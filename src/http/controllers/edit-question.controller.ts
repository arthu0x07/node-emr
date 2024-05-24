import {
  Controller,
  UseGuards,
  Body,
  Param,
  Put,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { z } from 'zod'
import { AuthGuard } from '@nestjs/passport'
import { UserPayload } from '@/auth/jwt-strategy'
import { CurrentUser } from '@/auth/current-user-decorator'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipes'
import { PrismaService } from '@/database/prisma/prisma.service'
import { QuestionService } from '@/http/services/question.service'

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
  constructor(
    private prisma: PrismaService,
    private questionService: QuestionService,
  ) {}

  @Put()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: EditQuestionBodySchema,
    @Param('id') questionId: string,
  ) {
    const userId = user.sub
    const { title, content, tags } = body

    await this.questionService.validateTags(tags)
    const slug = await this.questionService.generateUniqueSlug(title)

    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    })

    if (!question) {
      throw new NotFoundException('Question with the provider id not found')
    }

    if (question.authorID !== userId) {
      throw new UnauthorizedException()
    }

    const updatedQuestion = await this.prisma.question.update({
      where: {
        id: questionId,
      },
      data: {
        title,
        content,
        slug,
        tags: {
          connect: tags.map((tag) => ({ name: tag })),
        },
      },
      include: {
        tags: true,
      },
    })

    if (!updatedQuestion) {
      throw new BadRequestException()
    }

    return { ...updatedQuestion }
  }
}
