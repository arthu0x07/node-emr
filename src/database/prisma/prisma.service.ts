import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { seedTags } from 'prisma/seed/tags.seed'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['warn', 'error'],
    })
  }

  async onModuleInit() {
    await seedTags(this)
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}
