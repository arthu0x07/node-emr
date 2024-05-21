import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma/prisma.service'
import { CreateAccControler } from './controllers/create-acc.controller'
import { envSchema } from './env'
import { AuthenticateController } from './controllers/authenticate-controller'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [CreateAccControler, AuthenticateController],
  providers: [PrismaService],
})
export class AppModule {}
