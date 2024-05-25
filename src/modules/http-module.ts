import { Module } from '@nestjs/common'

import { DatabaseModule } from '@/database/database-module'

import { AttachmentsModule } from '@/modules/attachment/upload-attachment.module'
import { QuestionModule } from '@/modules/question/question.module'
import { AnswerModule } from './answer/answer.module'

@Module({
  imports: [AttachmentsModule, QuestionModule, AnswerModule, DatabaseModule],
})
export class HttpModule {}
