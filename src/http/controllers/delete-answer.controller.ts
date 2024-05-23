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

@Controller('/answers/:id')
@UseGuards(AuthGuard('jwt'))
export class DeleteAnswerController {
  constructor(private prisma: PrismaService) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') answerId: string) {
    const deletedAnswerId = await this.prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    })

    if (!deletedAnswerId) {
      throw new NotFoundException(`Answer with the provided ID not found`)
    }
  }
}
