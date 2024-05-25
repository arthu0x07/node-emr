import { Module } from '@nestjs/common'

import { DatabaseModule } from '@/database/database-module'

import { AttachmentsModule } from '@/modules/attachment/upload-attachment.module'
import { QuestionModule } from '@/modules/question/question.module'
import { AnswerModule } from '@/modules/answer/answer.module'
import { CommentModule } from '@/modules/comment/comment.module'

@Module({
  imports: [
    AttachmentsModule,
    QuestionModule,
    AnswerModule,
    CommentModule,
    DatabaseModule,
  ],
})
export class HttpModule {}
