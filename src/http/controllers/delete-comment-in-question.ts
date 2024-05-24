import {
  Controller,
  UseGuards,
  Param,
  Delete,
  HttpCode,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt-strategy'
import { PrismaService } from '@/database/prisma/prisma.service'

@Controller('/questions/comments/:id')
@UseGuards(AuthGuard('jwt'))
export class DeleteCommentController {
  constructor(private prisma: PrismaService) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('id') commentId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    })

    if (!comment) {
      throw new NotFoundException('Comment with the provided ID not found')
    }

    if (comment.authorId !== userId) {
      throw new UnauthorizedException()
    }

    await this.prisma.comment.delete({
      where: {
        id: commentId,
      },
    })
  }
}
