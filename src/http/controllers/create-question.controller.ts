import { Controller, Post, UseGuards, Body } from '@nestjs/common'
import { z } from 'zod'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt-strategy'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipes'
import { PrismaService } from '@/database/prisma/prisma.service'
import { QuestionService } from '@/http/services/question.service'

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
  constructor(
    private prisma: PrismaService,
    private questionService: QuestionService,
  ) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe)
    body: CreateQuestionBodySchema,
  ) {
    const userId = user.sub
    const { title, content, tags } = body
    await this.questionService.validateTags(tags)
    const slug = await this.questionService.generateUniqueSlug(title)

    const createdQuestion = await this.prisma.question.create({
      data: {
        authorID: userId,
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

    return { ...createdQuestion }
  }
}
