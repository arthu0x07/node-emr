import {
  Controller,
  UseGuards,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  Put,
  UnauthorizedException,
} from '@nestjs/common'
import { z } from 'zod'
import { AuthGuard } from '@nestjs/passport'
import { UserPayload } from '@/auth/jwt-strategy'
import { CurrentUser } from '@/auth/current-user-decorator'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipes'
import { PrismaService } from '@/database/prisma/prisma.service'

const editAnswerBodySchema = z.object({
  content: z.string(),
})

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>

const bodyValidationPipe = new ZodValidationPipe(editAnswerBodySchema)

@Controller('answers/:id')
@UseGuards(AuthGuard('jwt'))
export class EditAnswerController {
  constructor(private prisma: PrismaService) {}

  @Put()
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') answerId: string,
    @Body(bodyValidationPipe) body: EditAnswerBodySchema,
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

    if (answer.authorID !== userid) {
      throw new UnauthorizedException()
    }

    const editedAnswer = await this.prisma.answer.update({
      where: {
        id: answerId,
      },
      data: {
        content,
      },
    })

    if (!editedAnswer) {
      throw new BadRequestException()
    }

    return { ...editedAnswer }
  }
}
