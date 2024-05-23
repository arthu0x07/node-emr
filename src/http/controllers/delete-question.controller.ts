import {
  Controller,
  UseGuards,
  Param,
  Delete,
  HttpCode,
  NotFoundException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { PrismaService } from '@/database/prisma/prisma.service'

@Controller('/questions/:id')
@UseGuards(AuthGuard('jwt'))
export class DeleteQuestionController {
  constructor(private prisma: PrismaService) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') questionId: string) {
    const deletedQuestionId = await this.prisma.question.findUnique({
      where: {
        id: questionId,
      },
      select: {
        id: true,
      },
    })

    if (!deletedQuestionId) {
      throw new NotFoundException(`Question with the provided ID not found`)
    }
  }
}
