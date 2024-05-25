import { Module } from '@nestjs/common'

import { DatabaseModule } from '@/database/database-module'

import { AttachmentsModule } from '@/entities/attachment/attachment.module'
import { QuestionModule } from '@/entities/question/question.module'
import { AnswerModule } from '@/entities/answer/answer.module'
import { CommentModule } from '@/entities/comment/comment.module'
import { UserModule } from './user/user.module'
import { AuthenticateModule } from './authenticate/authenticate.module'

@Module({
  imports: [
    AttachmentsModule,
    QuestionModule,
    AnswerModule,
    CommentModule,
    UserModule,
    AuthenticateModule,
    DatabaseModule,
  ],
})
export class EntitiesModule {}
