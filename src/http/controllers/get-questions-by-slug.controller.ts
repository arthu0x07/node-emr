import {
  Controller,
  UseGuards,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PrismaService } from '@/database/prisma/prisma.service'

@Controller('/questions/:slug')
@UseGuards(AuthGuard('jwt'))
export class GetQuestionBySlugController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@Param('slug') slug: string) {
    const question = await this.prisma.question.findUnique({
      where: {
        slug,
      },
    })

    if (!question) {
      throw new BadRequestException('question slug not found')
    }

    return { question }
  }
}
