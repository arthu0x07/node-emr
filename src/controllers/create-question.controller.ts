import { Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('/questions')
export class CreateQuestionController {
  constructor() {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async handle() {
    return 'hello jwt'
  }
}
