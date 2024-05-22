import { Module } from '@nestjs/common'

import { CreateAccControler } from './controllers/create-acc.controller'
import { AuthenticateController } from './controllers/authenticate-controller'
import { CreateQuestionController } from './controllers/create-question.controller'
import { FetchRecentQuestions } from './controllers/fetch-recent-questions'

import { PrismaService } from '../prisma/prisma.service'

@Module({
  controllers: [
    CreateAccControler,
    AuthenticateController,
    CreateQuestionController,
    FetchRecentQuestions,
  ],
  providers: [PrismaService],
})
export class HttpModule {}
