import { AppModule } from '@/app.module'
import { PrismaService } from '@/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { randomUUID } from 'node:crypto'
import request from 'supertest'

describe('Comment Controller (E2E)', () => {
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
    await prisma.comment.deleteMany({})
    await prisma.answer.deleteMany({})
    await prisma.question.deleteMany({})
    await prisma.user.deleteMany({})
  })

  afterAll(async () => {
    await app.close()
  })

  test('[POST] /comments/answers/:answerId', async () => {
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
        title: 'Test question',
        content: 'Test content',
        slug: 'test-question',
        authorID: user.id,
      },
    })

    const answer = await prisma.answer.create({
      data: {
        content: 'Test answer',
        authorID: user.id,
        questionId: question.id,
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/comments/answers/${answer.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Test comment',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.createdComment).toEqual(
      expect.objectContaining({
        content: 'Test comment',
        authorId: user.id,
        answerId: answer.id,
      }),
    )
  })

  test('[DELETE] /comments/answers/:commentId', async () => {
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
        title: 'Test question',
        content: 'Test content',
        slug: 'test-question',
        authorID: user.id,
      },
    })

    const answer = await prisma.answer.create({
      data: {
        content: 'Test answer',
        authorID: user.id,
        questionId: question.id,
      },
    })

    const comment = await prisma.comment.create({
      data: {
        content: 'Test comment',
        authorId: user.id,
        answerId: answer.id,
      },
    })

    const response = await request(app.getHttpServer())
      .delete(`/comments/answers/${comment.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const deletedComment = await prisma.comment.findUnique({
      where: { id: comment.id },
    })

    expect(deletedComment).toBeNull()
  })

  test('[POST] /comments/questions/:questionId', async () => {
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
        title: 'Test question',
        content: 'Test content',
        slug: 'test-question',
        authorID: user.id,
      },
    })

    const response = await request(app.getHttpServer())
      .post(`/comments/questions/${question.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Test comment',
      })

    expect(response.statusCode).toBe(201)
    expect(response.body.createdComment).toEqual(
      expect.objectContaining({
        content: 'Test comment',
        authorId: user.id,
        questionId: question.id,
      }),
    )
  })

  test('[DELETE] /comments/questions/:commentId', async () => {
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
        title: 'Test question',
        content: 'Test content',
        slug: 'test-question',
        authorID: user.id,
      },
    })

    const comment = await prisma.comment.create({
      data: {
        content: 'Test comment',
        authorId: user.id,
        questionId: question.id,
      },
    })

    const response = await request(app.getHttpServer())
      .delete(`/comments/questions/${comment.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const deletedComment = await prisma.comment.findUnique({
      where: { id: comment.id },
    })

    expect(deletedComment).toBeNull()
  })
})
