import { Module } from '@nestjs/common'

import { DatabaseModule } from '@/database/database-module'

import { CreateAccControler } from './controllers/create-acc.controller'
import { AuthenticateController } from './controllers/authenticate-controller'
import { CreateQuestionController } from './controllers/create-question.controller'
import { EditQuestionController } from './controllers/edit-question.controller'
import { GetQuestionBySlug } from './controllers/get-questions-by-slug.controller'
import { GetRecentQuestions } from './controllers/get-recent-questions'
import { DeleteQuestionController } from './controllers/delete-question.controller'
import { CreateAnswerController } from './controllers/create-answer.controller'
import { EditAnswerController } from './controllers/edit-answer.controller'
import { DeleteAnswerController } from './controllers/delete-answer.controller'
import { GetQuestionAnswersController } from './controllers/get-answers-in-question.controller'
import { SelectBestAnswerController } from './controllers/select-best-answer.controller'
import { CreateCommentInQuestion } from './controllers/create-comment-in-question'
import { DeleteCommentController } from './controllers/delete-comment-in-question'
import { CreateCommentInAnswer } from './controllers/create-comment-in-answer.controller'

import { QuestionService } from './services/question.service'

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateAccControler,
    AuthenticateController,
    CreateQuestionController,
    GetRecentQuestions,
    GetQuestionBySlug,
    EditQuestionController,
    DeleteQuestionController,
    CreateAnswerController,
    EditAnswerController,
    DeleteAnswerController,
    GetQuestionAnswersController,
    SelectBestAnswerController,
    CreateCommentInQuestion,
    DeleteCommentController,
    CreateCommentInAnswer,
  ],
  providers: [QuestionService],
})
export class HttpModule {}
