import {
  ConflictException,
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipes'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const createAccBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

type CreateAccBodySchema = z.infer<typeof createAccBodySchema>

@Controller('/accounts')
export class CreateAccControler {
  constructor(private prisma: PrismaService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAccBodySchema))
  async handle(@Body() body: CreateAccBodySchema) {
    const { name, email, password } = createAccBodySchema.parse(body)

    const userEmailExists = await this.prisma.user.findUnique({
      where: { email },
    })

    if (userEmailExists) {
      throw new ConflictException('user email exits on database.')
    }

    await this.prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    })
  }
}
