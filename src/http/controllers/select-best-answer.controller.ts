import {
  BadRequestException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt-strategy'
import { PrismaService } from '@/database/prisma/prisma.service'

@Controller('/answers/:answerId/select-best-answer')
@UseGuards(AuthGuard('jwt'))
export class SelectBestAnswerController {
  constructor(private prisma: PrismaService) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('answerId') answerId: string,
  ) {
    const userId = user.sub

    const answer = await this.prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    })

    if (!answer) {
      throw new NotFoundException('Answer with the provider id not found')
    }

    const question = await this.prisma.question.findUnique({
      where: {
        id: answer.questionId,
      },
    })

    if (!question || question.authorID !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to select the best answer for this question',
      )
    }

    const updatedQuestion = await this.prisma.question.update({
      where: {
        id: answer.questionId,
        authorID: userId,
      },
      data: {
        bestAnwserId: answerId,
      },
    })

    if (!updatedQuestion) {
      throw new BadRequestException()
    }
  }
}
