import {
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
      throw new NotFoundException('answer not exist')
    }

    const question = await this.prisma.question.findUnique({
      where: {
        id: answer.questionId,
      },
      select: {
        authorID: true,
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
      throw new NotFoundException('Question not found.')
    }
  }
}
