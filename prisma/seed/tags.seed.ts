import { PrismaService } from '@/database/prisma/prisma.service'

const tagsToSeed = ['node', 'nestjs', 'prisma']

export async function seedTags(prisma: PrismaService) {
  for (const tagName of tagsToSeed) {
    const existingTag = await prisma.tag.findUnique({
      where: {
        name: tagName,
      },
    })

    if (!existingTag) {
      await prisma.tag.create({
        data: {
          name: tagName,
        },
      })
    }
  }
}
