import {
  Controller,
  UseGuards,
  Get,
  NotFoundException,
  Param,
  Query,
  BadRequestException,
  Body,
  Put,
  Delete,
  HttpCode,
  Post,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { z } from 'zod'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipes'
import { QuestionService } from './question.service'
import { UserPayload } from '@/auth/jwt-strategy'
import { CurrentUser } from '@/auth/current-user-decorator'
import { PrismaService } from '@/database/prisma/prisma.service'

const pageQueryParamsSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
})

const editQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
})

const queryValidationPipe = new ZodValidationPipe(pageQueryParamsSchema)
const createBodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)
const editBodyValidationPipe = new ZodValidationPipe(editQuestionBodySchema)

type PageQueryParamsSchema = z.infer<typeof pageQueryParamsSchema>
type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>
type EditQuestionBodySchema = z.infer<typeof editQuestionBodySchema>

@Controller('/questions')
@UseGuards(AuthGuard('jwt'))
export class QuestionController {
  constructor(
    private questionService: QuestionService,
    private prisma: PrismaService,
  ) {}

  @Get()
  async getRecentQuestions(
    @Query('page', queryValidationPipe) page: PageQueryParamsSchema,
  ) {
    const questions = await this.questionService.getRecentQuestions(page)
    return { questions }
  }

  @Get('/:slug')
  async getQuestionBySlug(@Param('slug') slug: string) {
    const question = await this.questionService.getQuestionBySlug(slug)

    if (!question) {
      throw new BadRequestException('Question slug not found')
    }

    return { question }
  }

  @Get('/:questionId/answers')
  async getQuestionAnswers(@Param('questionId') questionId: string) {
    const answers = await this.questionService.getQuestionAnswers(questionId)
    return { answers }
  }

  @Get('/:questionId/comments')
  async getQuestionComments(
    @Query('page', queryValidationPipe) page: PageQueryParamsSchema,
    @Param('questionId') questionId: string,
  ) {
    const question = await this.questionService.getQuestionById(questionId)

    if (!question) {
      throw new NotFoundException(`Question with the provided ID not found`)
    }

    const comments = await this.questionService.getQuestionComments(
      questionId,
      page,
    )

    return { comments }
  }

  @Post()
  async createQuestion(
    @CurrentUser() user: UserPayload,
    @Body(createBodyValidationPipe) body: CreateQuestionBodySchema,
  ) {
    const userId = user.sub
    const { title, content, tags } = body

    const createdQuestion = await this.questionService.createQuestion(
      userId,
      title,
      content,
      tags,
    )

    return { ...createdQuestion }
  }

  @Put('/:id')
  async editQuestion(
    @CurrentUser() user: UserPayload,
    @Body(editBodyValidationPipe) body: EditQuestionBodySchema,
    @Param('id') questionId: string,
  ) {
    const { title, content, tags } = body
    const userId = user.sub

    const updatedQuestion = await this.questionService.editQuestion(
      questionId,
      userId,
      title,
      content,
      tags,
    )

    if (!updatedQuestion) {
      throw new NotFoundException('Question with the provided id not found')
    }

    return { ...updatedQuestion }
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteQuestion(
    @Param('id') questionId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    await this.questionService.deleteQuestion(questionId, userId)
  }
}
