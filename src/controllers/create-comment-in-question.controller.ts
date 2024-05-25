import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { z } from 'zod'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt-strategy'
import { PrismaService } from '@/database/prisma/prisma.service'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipes'

const createAnswerBodySchema = z.object({
  content: z.string(),
})

const createAnswerBodyPipe = new ZodValidationPipe(createAnswerBodySchema)

type CreateAnswerBodySchema = z.infer<typeof createAnswerBodySchema>

@Controller('/questions/:questionId/comments')
@UseGuards(AuthGuard('jwt'))
export class CreateCommentInQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('questionId') questionId: string,
    @Body(createAnswerBodyPipe) body: CreateAnswerBodySchema,
  ) {
    const userid = user.sub
    const { content } = body

    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    })

    if (!question) {
      throw new NotFoundException()
    }

    const createdComment = await this.prisma.comment.create({
      data: {
        questionId,
        content,
        authorId: userid,
      },
    })

    return { createdComment }
  }
}
