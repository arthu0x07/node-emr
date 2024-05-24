import { Module } from '@nestjs/common'

import { DatabaseModule } from '@/database/database-module'

import { CreateAccControler } from './controllers/create-acc.controller'
import { AuthenticateController } from './controllers/authenticate-controller'
import { CreateQuestionController } from './controllers/create-question.controller'
import { EditQuestionController } from './controllers/edit-question.controller'
import { GetQuestionBySlugController } from './controllers/get-questions-by-slug.controller'
import { GetRecentQuestionsController } from './controllers/get-recent-questions.controller'
import { DeleteQuestionController } from './controllers/delete-question.controller'
import { CreateAnswerController } from './controllers/create-answer.controller'
import { EditAnswerController } from './controllers/edit-answer.controller'
import { DeleteAnswerController } from './controllers/delete-answer.controller'
import { GetQuestionAnswersController } from './controllers/get-answers-in-question.controller'
import { SelectBestAnswerController } from './controllers/select-best-answer.controller'
import { CreateCommentInQuestionController } from './controllers/create-comment-in-question.controller'
import { DeleteCommentInQuestionController } from './controllers/delete-comment-in-question.controller'
import { CreateCommentInAnswerController } from './controllers/create-comment-in-answer.controller'
import { DeleteCommentInAnswerController } from './controllers/delete-comment-in-answer.controller'
import { GetCommentsInAnswerController } from './controllers/get-comments-in-answer-controller'
import { GetCommentsInQuestionController } from './controllers/get-comments-in-questions-controller'

import { QuestionService } from './services/question.service'

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateAccControler,
    AuthenticateController,
    CreateQuestionController,
    EditQuestionController,
    GetQuestionBySlugController,
    GetRecentQuestionsController,
    DeleteQuestionController,
    CreateAnswerController,
    EditAnswerController,
    DeleteAnswerController,
    GetQuestionAnswersController,
    SelectBestAnswerController,
    CreateCommentInQuestionController,
    DeleteCommentInQuestionController,
    CreateCommentInAnswerController,
    DeleteCommentInAnswerController,
    GetCommentsInAnswerController,
    GetCommentsInQuestionController,
  ],
  providers: [QuestionService],
})
export class HttpModule {}
