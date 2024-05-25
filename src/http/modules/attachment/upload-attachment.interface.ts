export interface UploadAndCreateAttachmentRequest {
  fileName: string
  fileType: string
  body: Buffer
}

export interface Attachment {
  id: string
  title: string
  url: string
}
