import { jest } from '@jest/globals'
import '../helpers/setup-server-mocks.js'

const { createServer } = await import('../../../src/server.js')

let server

describe('home route', () => {
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

  test('GET /home returns index view if authenticated and has "user" scope', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/home',
      auth: {
        strategy: 'session',
        credentials: {
          sessionId: 'session-id',
          scope: ['user']
        }
      }
    })
    expect(response.statusCode).toBe(200)
    expect(response.request.response.source.template).toBe('home')
  })

  test('GET /home redirects to /auth/sign-in if not authenticated', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/home'
    })
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/auth/sign-in?redirect=/home')
  })

  test('GET /home returns 403 view if authenticated but not in "user" role', async () => {
    const response = await server.inject({
      method: 'GET',
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
})
