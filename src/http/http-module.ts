import { Module } from '@nestjs/common'

import { DatabaseModule } from '@/database/database-module'

import { CreateAccControler } from './controllers/create-acc.controller'
import { AuthenticateController } from './controllers/authenticate-controller'
import { CreateQuestionController } from './controllers/create-question.controller'
import { EditQuestionController } from './controllers/edit-question.controller'
import { GetQuestionBySlug } from './controllers/get-questions-by-slug.controller'
import { FetchRecentQuestions } from './controllers/fetch-recent-questions'
import { DeleteQuestionController } from './controllers/delete-question.controller'
import { CreateAnswerController } from './controllers/create-answer.controller'
import { EditAnswerController } from './controllers/edit-answer.controller'
import { DeleteAnswerController } from './controllers/delete-answer.controller'
import { GetQuestionAnswersController } from './controllers/get-answers-in-question.controller'
import { SelectBestAnswerController } from './controllers/select-best-answer.controller'

import { QuestionService } from './services/question.service'

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateAccControler,
    AuthenticateController,
    CreateQuestionController,
    FetchRecentQuestions,
    GetQuestionBySlug,
    EditQuestionController,
    DeleteQuestionController,
    CreateAnswerController,
    EditAnswerController,
    DeleteAnswerController,
    GetQuestionAnswersController,
    SelectBestAnswerController,
  ],
  providers: [QuestionService], // Adicione o QuestionService aqui nos providers
})
export class HttpModule {}
