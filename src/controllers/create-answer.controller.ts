import {
  Controller,
  UseGuards,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  Post,
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

type CreateAnswerBodySchema = z.infer<typeof createAnswerBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createAnswerBodySchema)

@Controller('/questions/:id/answers')
@UseGuards(AuthGuard('jwt'))
export class CreateAnswerController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Param('id') questionId: string,
    @Body(bodyValidationPipe) body: CreateAnswerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body
    const userId = user.sub

    const questionExists = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    })

    if (!questionExists) {
      throw new NotFoundException(`Question with the provided ID not found`)
    }

    const createdAnswer = await this.prisma.answer.create({
      data: {
        content,
        questionId,
        authorID: userId,
      },
    })

    if (!createdAnswer) {
      throw new BadRequestException()
    }

    return { ...createdAnswer }
  }
}
