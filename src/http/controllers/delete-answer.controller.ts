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

@Controller('/answers/:id')
@UseGuards(AuthGuard('jwt'))
export class DeleteAnswerController {
  constructor(private prisma: PrismaService) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('id') answerId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    const answer = await this.prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    })

    if (!answer) {
      throw new NotFoundException('Answer with the provided ID not found')
    }

    if (answer.authorID !== userId) {
      throw new UnauthorizedException()
    }

    const deletedAnswer = await this.prisma.answer.delete({
      where: {
        id: answerId,
      },
    })

    if (!deletedAnswer) {
      throw new BadRequestException()
    }
  }
}
