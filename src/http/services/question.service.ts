import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from '@/database/prisma/prisma.service'

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async validateTags(tags: string[]): Promise<void> {
    const existingTags = await this.prisma.tag.findMany({
      where: { name: { in: tags } },
    })

    if (existingTags.length !== tags.length) {
      const nonExistingTags = tags.filter(
        (tag) => !existingTags.some((existingTag) => existingTag.name === tag),
      )
      throw new ConflictException(
        `invalid tag(s) provided: ${nonExistingTags.join(', ')}`,
      )
    }
  }

  async generateUniqueSlug(title: string): Promise<string> {
    const slug = this.convertToSlug(title)

    const titleExists = await this.prisma.question.findMany({
      where: { title },
      select: { title: true },
    })

    console.log('generate basic slug', slug)

    return `${slug}-${titleExists.length}`
  }

  convertToSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }
}
