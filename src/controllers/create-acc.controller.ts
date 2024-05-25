import {
  ConflictException,
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { PrismaService } from '@/database/prisma/prisma.service'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipes'

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

    const hashedPassword = await hash(password, 8)

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })
  }
}
