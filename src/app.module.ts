import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { CreateAccControler } from './controllers/create-acc.controller'

@Module({
  imports: [],
  controllers: [CreateAccControler],
  providers: [PrismaService],
})
export class AppModule {}
