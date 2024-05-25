// comment.controller.ts
import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt-strategy'

import { CommentService } from './comment.service'

import { z } from 'zod'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipes'

const createCommentBodySchema = z.object({
  content: z.string(),
})

const createCommentBodyPipe = new ZodValidationPipe(createCommentBodySchema)

type CreateCommentBodySchema = z.infer<typeof createCommentBodySchema>

@Controller('/comments')
@UseGuards(AuthGuard('jwt'))
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/answers/:answerId')
  async createCommentInAnswer(
    @CurrentUser() user: UserPayload,
    @Param('answerId') answerId: string,
    @Body(createCommentBodyPipe) body: CreateCommentBodySchema,
  ) {
    const userId = user.sub
    const { content } = body

    const createdComment = await this.commentService.createCommentInAnswer(
      answerId,
      userId,
      content,
    )

    return { createdComment }
  }

  @Delete('/answers/:commentId')
  @HttpCode(204)
  async deleteCommentInAnswer(
    @Param('commentId') commentId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    await this.commentService.deleteCommentInAnswer(commentId, userId)
  }

  @Post('/questions/:questionId')
  async createCommentInQuestion(
    @CurrentUser() user: UserPayload,
    @Param('questionId') questionId: string,
    @Body(createCommentBodyPipe) body: CreateCommentBodySchema,
  ) {
    const { content } = body
    const userId = user.sub

    const createdComment = await this.commentService.createCommentInQuestion(
      questionId,
      userId,
      content,
    )

    return { createdComment }
  }

  @Delete('/questions/:commentId')
  @HttpCode(204)
  async deleteCommentInQuestion(
    @Param('commentId') commentId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    await this.commentService.deleteCommentInQuestion(commentId, userId)
  }
}
