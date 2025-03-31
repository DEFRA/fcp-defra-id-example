import { jest } from '@jest/globals'
import '../helpers/setup-server-mocks.js'

const { createServer } = await import('../../../src/server.js')

const sessionId = 'session-id'

let server

describe('sso plugin', () => {
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

  test('should redirect any route that includes "ssoOrgId" parameter to /auth/organisation', async () => {
    const response = await server.inject({
      url: '/home?ssoOrgId=12345',
      auth: {
        strategy: 'session',
        credentials: {
          sessionId
        }
      }
    })
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toBe('/auth/organisation?organisationId=12345&redirect=/home')
  })

  test('should remove "ssoOrgId" param from redirection string', async () => {
    const response = await server.inject({
      url: '/home?ssoOrgId=12345',
      auth: {
        strategy: 'session',
        credentials: {
          sessionId
        }
      }
    })
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).not.toMatch(/ssoOrgId=/)
  })

  test('should retain all other query parameters in the redirection string', async () => {
    const response = await server.inject({
      url: '/home?ssoOrgId=12345&otherParam=value',
      auth: {
        strategy: 'session',
        credentials: {
          sessionId
        }
      }
    })
    expect(response.statusCode).toBe(302)
    expect(response.headers.location).toMatch(/otherParam=value/)
  })
})
