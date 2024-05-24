import {
  Controller,
  UseGuards,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
  Put,
} from '@nestjs/common'
import { z } from 'zod'
import { AuthGuard } from '@nestjs/passport'
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
    @Param('id') answerId: string,
    @Body(bodyValidationPipe) body: EditAnswerBodySchema,
  ) {
    const { content } = body

    const answerExists = await this.prisma.answer.findUnique({
      where: {
        id: answerId,
      },
    })

    if (!answerExists) {
      throw new NotFoundException(`Question with the provided ID not found`)
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
