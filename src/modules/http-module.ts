import { Module } from '@nestjs/common'

import { DatabaseModule } from '@/database/database-module'

import { AttachmentsModule } from '@/modules/attachment/upload-attachment.module'
import { QuestionModule } from '@/modules/question/question.module'

@Module({
  imports: [AttachmentsModule, QuestionModule, DatabaseModule],
})
export class HttpModule {}
