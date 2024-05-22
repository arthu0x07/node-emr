import { Module } from '@nestjs/common'

import { CreateAccControler } from './controllers/create-acc.controller'
import { AuthenticateController } from './controllers/authenticate-controller'
import { CreateQuestionController } from './controllers/create-question.controller'
import { FetchRecentQuestions } from './controllers/fetch-recent-questions'

import { DatabaseModule } from '@/database/database-module'

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateAccControler,
    AuthenticateController,
    CreateQuestionController,
    FetchRecentQuestions,
  ],
})
export class HttpModule {}
