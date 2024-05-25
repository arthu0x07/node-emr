import { Module } from '@nestjs/common'
import { PrismaService } from '@/database/prisma/prisma.service'
import { AuthenticateController } from './authenticate.controller'
import { AuthenticateService } from './authenticate.service'

@Module({
  controllers: [AuthenticateController],
  providers: [PrismaService, AuthenticateService],
})
export class AuthenticateModule {}
