import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { PrismaService } from '@/database/prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  Attachment,
  UploadAndCreateAttachmentRequest,
} from './upload-attachment.interface'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type.error'

@Injectable()
export class AttachmentService {
  private client: S3Client

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const accountId = config.get('CLOUDFLARE_ACC_ID')
    const accessKey = config.get('AWS_ACCESS_KEY_ID')
    const secretAccessKey = config.get('AWS_SECRET_ACCESS_KEY')

    this.client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey,
      },
    })
  }

  async uploadAndCreateAttachment({
    fileName,
    fileType,
    body,
  }: UploadAndCreateAttachmentRequest): Promise<Attachment> {
    if (!/^(image\/(jpeg|png))$|^application\/pdf$/.test(fileType)) {
      throw new InvalidAttachmentTypeError(fileType)
    }

    const { url } = await this.upload({ fileName, fileType, body })
    return this.createAttachment({ title: fileName, url })
  }

  private async upload({
    fileName,
    fileType,
    body,
  }: UploadAndCreateAttachmentRequest): Promise<{ url: string }> {
    const uploadId = randomUUID()
    const uniqueFileName = `${uploadId}-${fileName}`

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.get('AWS_BUCKET_NAME'),
        Key: uniqueFileName,
        ContentType: fileType,
        Body: body,
      }),
    )

    return {
      url: uniqueFileName,
    }
  }

  private async createAttachment({
    title,
    url,
  }: {
    title: string
    url: string
  }): Promise<Attachment> {
    const attachment = await this.prisma.attachment.create({
      data: { title, url },
    })

    return {
      id: attachment.id.toString(),
      title: attachment.title,
      url: attachment.url,
    }
  }
}
