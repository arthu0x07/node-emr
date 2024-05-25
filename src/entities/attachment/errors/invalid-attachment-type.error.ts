// invalid-attachment-type.error.ts
import { BadRequestException } from '@nestjs/common'

export class InvalidAttachmentTypeError extends BadRequestException {
  constructor(fileType: string) {
    super(`Invalid attachment type: ${fileType}`)
  }
}
