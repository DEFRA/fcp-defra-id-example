import { jest } from '@jest/globals'
import { mockOidcConfig } from '../helpers/setup-server-mocks.js'

const { createServer } = await import('../../../src/server.js')

let server

describe('auth routes', () => {
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

  describe('GET /auth/sign-in', () => {
    test('redirects to /home if authenticated', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/auth/sign-in',
        auth: {
          strategy: 'defra-id',
          credentials: {
            sessionId: 'session-id'
          }
        }
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/home')
    })

    test('redirects to oidc sign in page if unauthenticated', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/auth/sign-in'
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location.startsWith(mockOidcConfig.authorization_endpoint)).toBe(true)
    })
  })
})
