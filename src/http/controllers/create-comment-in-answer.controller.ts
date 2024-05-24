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
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipes'

const createCommentBodySchema = z.object({
  content: z.string(),
})

const createCommentBodyPipe = new ZodValidationPipe(createCommentBodySchema)

type CreateCommentBodySchema = z.infer<typeof createCommentBodySchema>

@Controller('/answers/:answerId/comments')
@UseGuards(AuthGuard('jwt'))
export class CreateCommentInAnswer {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('answerId') answerId: string,
    @Body(createCommentBodyPipe) body: CreateCommentBodySchema,
  ) {
    const userid = user.sub
    const { content } = body

    const answer = await this.prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    })

    if (!answer) {
      throw new NotFoundException('Answer with the provider id not found')
    }

    const createdComment = await this.prisma.comment.create({
      data: {
        answerId,
        content,
        authorId: userid,
      },
    })

    return { createdComment }
  }
}
