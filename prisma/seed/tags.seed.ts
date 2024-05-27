export async function seedTags(prisma) {
  const tagsToSeed = ['node', 'nestjs', 'prisma']
  for (const tagName of tagsToSeed) {
    const existingTag = await prisma.tag.findUnique({
      where: { name: tagName },
    })
    if (!existingTag) {
      await prisma.tag.create({ data: { name: tagName } })
    }
  }
}
