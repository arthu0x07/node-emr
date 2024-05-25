import {
  Controller,
  UseGuards,
  Param,
  Body,
  Post,
  Delete,
  Patch,
  Get,
  Query,
  Put,
  HttpCode,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt-strategy'
import { AnswerService } from './answer.service'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipes'
import { z } from 'zod'

const createAnswerBodySchema = z.object({
  content: z.string(),
})

const editAnswerBodySchema = z.object({
  content: z.string(),
})

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const bodyValidationPipe = new ZodValidationPipe(createAnswerBodySchema)
const editBodyValidationPipe = new ZodValidationPipe(editAnswerBodySchema)
const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type CreateAnswerBodySchema = z.infer<typeof createAnswerBodySchema>
type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>
type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/answers')
@UseGuards(AuthGuard('jwt'))
export class AnswerController {
  constructor(private answerService: AnswerService) {}
  @Get('/:answerId/comments')
  async getCommentsInAnswer(
    @Param('answerId') answerId: string,
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
  ) {
    const comments = await this.answerService.getCommentsInAnswer(
      answerId,
      page,
    )
    return { comments }
  }

  @Post('/:answerId')
  async createAnswer(
    @Param('answerId') questionId: string,
    @Body(bodyValidationPipe) body: CreateAnswerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body
    const userId = user.sub

    const createdAnswer = await this.answerService.createAnswer(
      userId,
      questionId,
      content,
    )
    return { ...createdAnswer }
  }

  @Put('/:answerId')
  async editAnswer(
    @Param('answerId') answerId: string,
    @Body(editBodyValidationPipe) body: EditAnswerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body
    const userId = user.sub

    const editedAnswer = await this.answerService.editAnswer(
      answerId,
      userId,
      content,
    )

    return { ...editedAnswer }
  }

  @Patch('/:answerId/select-best-answer')
  async selectBestAnswer(
    @Param('answerId') answerId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub
    await this.answerService.selectBestAnswer(answerId, userId)
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteAnswer(
    @Param('id') answerId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    await this.answerService.deleteAnswer(answerId, userId)
  }
}
