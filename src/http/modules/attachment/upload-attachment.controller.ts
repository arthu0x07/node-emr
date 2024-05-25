// upload-attachment.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AuthGuard } from '@nestjs/passport'
import { AttachmentService } from './upload-attachment.service'
import { Attachment } from './upload-attachment.interface'
import { ParseFilePipe } from './pipes/parse-file-pipe'

@UseGuards(AuthGuard('jwt'))
@Controller('/attachments')
export class UploadAttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
  ): Promise<{ attachmentId: string }> {
    if (!file) {
      throw new BadRequestException('File is required')
    }

    const attachment: Attachment =
      await this.attachmentService.uploadAndCreateAttachment({
        fileName: file.originalname,
        fileType: file.mimetype,
        body: file.buffer,
      })

    if (!attachment) {
      throw new BadRequestException(
        'An error occurred while uploading the attachment',
      )
    }

    return { attachmentId: attachment.id }
  }
}
