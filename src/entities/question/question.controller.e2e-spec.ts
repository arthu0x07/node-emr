import { AppModule } from '@/app.module'
import { PrismaService } from '@/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { randomUUID } from 'node:crypto'
import request from 'supertest'

describe('Create question (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  beforeEach(async () => {
    try {
      await prisma.tag.delete({
        where: {
          name: 'test-tag',
        },
      })
      await prisma.tag.delete({
        where: {
          name: 'test-tag2',
        },
      })
      await prisma.user.delete({
        where: {
          email: `${randomUUID()}@example.com`,
        },
      })
    } catch (err) {}
  })

  test('[GET] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'teste teste',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    await prisma.tag.createMany({
      data: [{ name: 'test-tag' }, { name: 'test-tag2' }],
    })

    await prisma.question.create({
      data: {
        title: 'test',
        slug: 'test-question',
        content: 'test content',
        tags: {
          connect: [{ name: 'test-tag' }, { name: 'test-tag2' }],
        },
        authorID: user.id,
      },
    })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)

    expect.extend({
      toBeStringOrNull(received) {
        const pass = received === null || typeof received === 'string'
        if (pass) {
          return {
            message: () => `expected ${received} not to be a string or null`,
            pass: true,
          }
        } else {
          return {
            message: () => `expected ${received} to be a string or null`,
            pass: false,
          }
        }
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      questions: expect.arrayContaining([
        expect.objectContaining({
          authorID: expect.any(String),
          bestAnswerId: expect.toBeStringOrNull(),
          content: expect.any(String),
          createdAt: expect.any(String),
          id: expect.any(String),
          slug: expect.any(String),
          title: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    })
  })

  test('[GET] /questions/:slug', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'teste teste',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    await prisma.tag.createMany({
      data: [{ name: 'test-tag' }, { name: 'test-tag2' }],
    })

    await prisma.question.create({
      data: {
        title: 'test',
        slug: 'test-slug',
        content: 'test content',
        tags: {
          connect: [{ name: 'test-tag' }, { name: 'test-tag2' }],
        },
        authorID: user.id,
      },
    })

    const response = await request(app.getHttpServer())
      .get('/questions/test-slug')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      question: expect.objectContaining({
        title: 'test',
        content: 'test content',
        tags: [{ name: 'test-tag' }, { name: 'test-tag2' }],
      }),
    })
  })

  test('[GET] /questions/:questionId/answers', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'teste teste',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const userId = user.id

    const { id: questionId } = await prisma.question.create({
      data: {
        title: 'Question with Answers',
        content: 'Content',
        slug: 'question-with-answers',
        author: {
          connect: { id: userId },
        },
      },
      select: {
        id: true,
      },
    })

    await prisma.answer.create({
      data: {
        content: 'Answer content',
        authorID: userId,
        questionId,
      },
    })

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      answers: expect.arrayContaining([
        expect.objectContaining({
          content: 'Answer content',
          authorID: userId,
        }),
      ]),
    })
  })

  test('[GET] /questions/:questionId/comments', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'teste teste',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const userId = user.id

    const question = await prisma.question.create({
      data: {
        title: 'Question with Comments',
        content: 'Question Content',
        slug: 'question-with-comments',
        authorID: userId,
      },
    })

    await prisma.comment.create({
      data: {
        content: 'Comment Content',
        authorId: userId,
        questionId: question.id,
      },
    })

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1 })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({
          content: 'Comment Content',
          authorId: userId,
          questionId: question.id,
        }),
      ]),
    })
  })

  test('[POST] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'teste teste',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    await prisma.tag.createMany({
      data: [{ name: 'test-tag' }, { name: 'test-tag2' }],
    })

    const attachmentData = [
      {
        title: 'Attachment 1',
        url: 'url1',
      },
      {
        title: 'Attachment 2',
        url: 'url2',
      },
    ]

    const attachments = await Promise.all(
      attachmentData.map(async (attachment) => {
        return await prisma.attachment.create({ data: attachment })
      }),
    )

    const attachmentsIds = attachments.map((attachment) => attachment.id)

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New question',
        content: 'New question content',
        tags: ['test-tag', 'test-tag2'],
        attachments: [...attachmentsIds],
      })

    expect(response.statusCode).toBe(201)

    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        title: 'New question',
      },
      include: {
        attachments: true,
      },
    })

    expect(questionOnDatabase).toBeTruthy()

    if (questionOnDatabase !== null) {
      expect(questionOnDatabase.attachments).toHaveLength(2)
    }

    expect(response.body).toEqual(
      expect.objectContaining({
        content: 'New question content',
        title: 'New question',
        tags: expect.arrayContaining([
          expect.objectContaining({
            name: 'test-tag',
          }),
          expect.objectContaining({
            name: 'test-tag2',
          }),
        ]),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            url: expect.any(String),
            questionId: expect.any(String),
            answerId: null,
          }),
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            url: expect.any(String),
            questionId: expect.any(String),
            answerId: null,
          }),
        ]),
      }),
    )
  })

  test('[PUT] /questions/:id', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'teste teste',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    await prisma.tag.createMany({
      data: [{ name: 'test-tag' }, { name: 'test-tag2' }],
    })

    const attachmentData = [
      {
        title: 'Attachment 1',
        url: 'url1',
      },
      {
        title: 'Attachment 2',
        url: 'url2',
      },
    ]

    const attachments = await Promise.all(
      attachmentData.map(async (attachment) => {
        return await prisma.attachment.create({ data: attachment })
      }),
    )

    const attachmentsIds = attachments.map((attachment) => attachment.id)

    const createdQuestion = await prisma.question.create({
      data: {
        title: 'New question',
        slug: 'new-question-test',
        content: 'New question content',
        tags: {
          connect: [{ name: 'test-tag' }, { name: 'test-tag2' }],
        },
        authorID: user.id,
        attachments: {
          connect: { id: attachmentsIds[0] },
        },
      },
    })

    expect(createdQuestion).toBeTruthy()

    const response = await request(app.getHttpServer())
      .put(`/questions/${createdQuestion.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New question edited',
        content: 'New question edited content',
        tags: ['test-tag', 'test-tag2'],
        attachments: [attachmentsIds[1]],
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        title: 'New question edited',
        content: 'New question edited content',
        tags: expect.arrayContaining([
          expect.objectContaining({
            name: 'test-tag',
          }),
          expect.objectContaining({
            name: 'test-tag2',
          }),
        ]),
        attachments: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            url: expect.any(String),
            questionId: expect.any(String),
            answerId: null,
          }),
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            url: expect.any(String),
            questionId: expect.any(String),
            answerId: null,
          }),
        ]),
      }),
    )
  })

  test('[DELETE] /questions/:id', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'teste teste',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    await prisma.tag.createMany({
      data: [{ name: 'test-tag' }, { name: 'test-tag2' }],
    })

    const createdQuestion = await prisma.question.create({
      data: {
        title: 'New question to delete',
        slug: 'new-question-test',
        content: 'New question to delete content',
        tags: {
          connect: [{ name: 'test-tag' }, { name: 'test-tag2' }],
        },
        authorID: user.id,
      },
    })

    expect(createdQuestion).toBeTruthy()

    const response = await request(app.getHttpServer())
      .delete(`/questions/${createdQuestion.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toEqual(204)
  })
})
