import { constants } from 'http2'
import { jest } from '@jest/globals'
import '../helpers/setup-server-mocks.js'

const { HTTP_STATUS_OK, HTTP_STATUS_FORBIDDEN, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_INTERNAL_SERVER_ERROR } = constants

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
    expect(response.statusCode).toBe(HTTP_STATUS_FORBIDDEN)
    expect(response.request.response.source.template).toBe('403')
  })

  test('should return 404 for non-existent route', async () => {
    const response = await server.inject({
      url: '/non-existent-route'
    })
    expect(response.statusCode).toBe(HTTP_STATUS_NOT_FOUND)
    expect(response.request.response.source.template).toBe('404')
  })

  test('should return 500 for internal server error', async () => {
    server.ext('onRequest', (_request, _h) => {
      throw new Error('Internal Server Error')
    })

    const response = await server.inject({
      url: '/'
    })
    expect(response.statusCode).toBe(HTTP_STATUS_INTERNAL_SERVER_ERROR)
    expect(response.request.response.source.template).toBe('500')
  })

  test('should pass through to next handler if no error', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.statusCode).toBe(HTTP_STATUS_OK)
  })

  test('should preserve security headers if error', async () => {
    server.ext('onRequest', (_request, _h) => {
      throw new Error('Internal Server Error')
    })

    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['x-content-type-options']).toBeDefined()
    expect(response.headers['x-frame-options']).toBeDefined()
    expect(response.headers['x-robots-tag']).toBeDefined()
    expect(response.headers['x-xss-protection']).toBeDefined()
    expect(response.headers['cross-origin-opener-policy']).toBeDefined()
    expect(response.headers['cross-origin-embedder-policy']).toBeDefined()
    expect(response.headers['cross-origin-resource-policy']).toBeDefined()
    expect(response.headers['referrer-policy']).toBeDefined()
    expect(response.headers['strict-transport-security']).toBeDefined()
    expect(response.headers['permissions-policy']).toBeDefined()
    expect(response.headers['content-security-policy']).toBeDefined()
  })
})
