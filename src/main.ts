import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'

import { Env } from './env'

import { seedTags } from 'prisma/seed/tags.seed'
import { PrismaService } from '@/database/prisma/prisma.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get<ConfigService<Env, true>>(ConfigService)
  const port = configService.get('PORT', { infer: true })

  const prismaService = app.get(PrismaService)
  await seedTags(prismaService)

  app.listen(port)
}

bootstrap()
