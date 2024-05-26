import { AppModule } from '@/app.module'
import { PrismaService } from '@/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { randomUUID } from 'node:crypto'
import request from 'supertest'

describe('AnswerController (E2E)', () => {
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
      await prisma.comment.deleteMany()
      await prisma.answer.deleteMany()
      await prisma.question.deleteMany()
      await prisma.user.delete({
        where: {
          email: `${randomUUID()}@example.com`,
        },
      })
    } catch (err) {}
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /answers/:answerId/comments', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'test user',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const question = await prisma.question.create({
      data: {
        title: 'test question',
        content: 'test content',
        slug: 'test-question',
        authorID: user.id,
      },
    })

    const answer = await prisma.answer.create({
      data: {
        content: 'test answer',
        authorID: user.id,
        questionId: question.id,
      },
    })

    await prisma.comment.create({
      data: {
        content: 'test comment',
        authorId: user.id,
        answerId: answer.id,
      },
    })

    const response = await request(app.getHttpServer())
      .get(`/answers/${answer.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1 })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({
          content: 'test comment',
          authorId: user.id,
          answerId: answer.id,
        }),
      ]),
    })
  })

  test('[POST] /answers/:questionId', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'test user',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const question = await prisma.question.create({
      data: {
        title: 'test question',
        content: 'test content',
        slug: 'test-question',
        authorID: user.id,
      },
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
      .post(`/answers/${question.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'test answer content',
        attachments: [...attachmentsIds],
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual(
      expect.objectContaining({
        content: 'test answer content',
        questionId: question.id,
        authorID: user.id,
        attachments: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            url: expect.any(String),
            answerId: expect.any(String),
            questionId: null,
          }),
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            url: expect.any(String),
            answerId: expect.any(String),
            questionId: null,
          }),
        ]),
      }),
    )
  })

  test('[PUT] /answers/:answerId', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'test user',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const question = await prisma.question.create({
      data: {
        title: 'test question',
        content: 'test content',
        slug: 'test-question',
        authorID: user.id,
      },
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

    const createdAnswer = await prisma.answer.create({
      data: {
        content: 'test answer',
        authorID: user.id,
        questionId: question.id,
        attachments: {
          connect: { id: attachmentsIds[0] },
        },
      },
    })

    expect(createdAnswer).toBeTruthy()

    const response = await request(app.getHttpServer())
      .put(`/answers/${createdAnswer.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'updated answer content',
        attachments: [attachmentsIds[1]],
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        content: 'updated answer content',
        id: createdAnswer.id,
        attachments: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            url: expect.any(String),
            answerId: expect.any(String),
            questionId: null,
          }),
        ]),
      }),
    )
  })

  test('[PATCH] /answers/:answerId/select-best-answer', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'test user',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const question = await prisma.question.create({
      data: {
        title: 'test question',
        content: 'test content',
        slug: 'test-question',
        authorID: user.id,
      },
    })

    const answer = await prisma.answer.create({
      data: {
        content: 'test answer',
        authorID: user.id,
        questionId: question.id,
      },
    })

    const response = await request(app.getHttpServer())
      .patch(`/answers/${answer.id}/select-best-answer`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)

    const updatedQuestion = await prisma.question.findUnique({
      where: { id: question.id },
    })

    expect(updatedQuestion).not.toBeNull()

    if (updatedQuestion !== null) {
      expect(updatedQuestion.bestAnswerId).toBe(answer.id)
    }
  })

  test('[DELETE] /answers/:id', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'test user',
        email: `${randomUUID()}@example.com`,
        password: '123456',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const question = await prisma.question.create({
      data: {
        title: 'test question',
        content: 'test content',
        slug: 'test-question',
        authorID: user.id,
      },
    })

    const answer = await prisma.answer.create({
      data: {
        content: 'test answer',
        authorID: user.id,
        questionId: question.id,
      },
    })

    const response = await request(app.getHttpServer())
      .delete(`/answers/${answer.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const deletedAnswer = await prisma.answer.findUnique({
      where: { id: answer.id },
    })

    expect(deletedAnswer).toBeNull()
  })
})
