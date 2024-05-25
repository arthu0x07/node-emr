// attachments.module.ts
import { Module } from '@nestjs/common'
import { UploadAttachmentController } from './attachment.controller'
import { AttachmentService } from './attachment.service'
import { DatabaseModule } from '@/database/database-module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [UploadAttachmentController],
  providers: [AttachmentService],
})
export class AttachmentsModule {}
