import {
  Controller,
  UseGuards,
  Param,
  Delete,
  HttpCode,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt-strategy'
import { PrismaService } from '@/database/prisma/prisma.service'

@Controller('/questions/:id')
@UseGuards(AuthGuard('jwt'))
export class DeleteQuestionController {
  constructor(private prisma: PrismaService) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('id') questionId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
    })

    if (!question) {
      throw new NotFoundException('Question with the provided ID not found')
    }

    if (question.authorID !== userId) {
      throw new UnauthorizedException()
    }

    const deletedQuestion = await this.prisma.question.delete({
      where: {
        id: questionId,
      },
    })

    if (!deletedQuestion) {
      throw new BadRequestException()
    }
  }
}
