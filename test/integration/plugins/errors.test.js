import { jest } from '@jest/globals'
import '../helpers/setup-server-mocks.js'

const { createServer } = await import('../../../src/server.js')

let server

describe('errors', () => {
  beforeEach(async () => {
    jest.clearAllMocks()

    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('should return 403 for forbidden route', async () => {
    const response = await server.inject({
      url: '/home',
      auth: {
        strategy: 'session',
        credentials: {
          sessionId: 'session-id',
          scope: ['admin']
        }
      }
    })
    expect(response.statusCode).toBe(403)
    expect(response.request.response.source.template).toBe('403')
  })

  test('should return 404 for non-existent route', async () => {
    const response = await server.inject({
      url: '/non-existent-route'
    })
    expect(response.statusCode).toBe(404)
    expect(response.request.response.source.template).toBe('404')
  })

  test('should return 500 for internal server error', async () => {
    server.ext('onRequest', (_request, _h) => {
      throw new Error('Internal Server Error')
    })

    const response = await server.inject({
      url: '/'
    })
    expect(response.statusCode).toBe(500)
    expect(response.request.response.source.template).toBe('500')
  })

  test('should pass through to next handler if no error', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.statusCode).toBe(200)
  })
})
