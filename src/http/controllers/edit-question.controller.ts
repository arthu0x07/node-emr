import { Controller, UseGuards, Body, Param, Put } from '@nestjs/common'
import { z } from 'zod'
import { AuthGuard } from '@nestjs/passport'
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
    @Body(bodyValidationPipe) body: EditQuestionBodySchema,
    @Param('id') questionId: string,
  ) {
    const { title, content, tags } = body
    await this.questionService.validateTags(tags)
    const slug = await this.questionService.generateUniqueSlug(title)

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

    return { updatedQuestion }
  }

  // used to create a better slug with no accents and white spaces
}
