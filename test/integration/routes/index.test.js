import { jest } from '@jest/globals'
import '../helpers/setup-server-mocks.js'

const { createServer } = await import('../../../src/server')

let server

describe('index route', () => {
  beforeAll(async () => {
    jest.clearAllMocks()

    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('GET / returns a 200 response', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/'
    })
    expect(response.statusCode).toBe(200)
  })

  test('GET / returns index view', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/'
    })
    expect(response.request.response.source.template).toBe('index')
  })
})
