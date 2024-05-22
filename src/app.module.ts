import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from './prisma/prisma.service'

import { envSchema } from './env'
import { AuthModule } from './auth/auth.module'

import { CreateAccControler } from './controllers/create-acc.controller'
import { AuthenticateController } from './controllers/authenticate-controller'
import { CreateQuestionController } from './controllers/create-question.controller'
import { FetchRecentQuestions } from './controllers/fetch-recent-questions'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [
    CreateAccControler,
    AuthenticateController,
    CreateQuestionController,
    FetchRecentQuestions,
  ],
  providers: [PrismaService],
})
export class AppModule {}
