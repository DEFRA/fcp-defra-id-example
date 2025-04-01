import { jest } from '@jest/globals'
import '../helpers/setup-server-mocks.js'

const { createServer } = await import('../../../src/server.js')

const CACHE_CONTROL_HEADER = 'cache-control'

let server

describe('headers', () => {
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

  test('should prevent MIME sniffing attacks ', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['x-content-type-options']).toBe('nosniff')
  })

  test('should prevent clickjacking attacks', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['x-frame-options']).toBe('DENY')
  })

  test('should prevent robots from indexing pages', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['x-robots-tag']).toBe('noindex, nofollow')
  })

  test('should prevent cross-site scripting attacks', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['x-xss-protection']).toBe('1; mode=block')
  })

  test('should ensure pages can only interact with the same origin', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['cross-origin-opener-policy']).toBe('same-origin')
  })

  test('should ensure pages can only be embedded by the same origin', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['cross-origin-embedder-policy']).toBe('require-corp')
  })

  test('should ensure pages can only interact with the same site', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['cross-origin-resource-policy']).toBe('same-site')
  })

  test('should ensure no referrer information is leaked', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['referrer-policy']).toBe('no-referrer')
  })

  test('should ensure strict transport security', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains; preload')
  })

  test('should restrict permissions for sensitive features', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['permissions-policy']).toBe('camera=(), geolocation=(), magnetometer=(), microphone=(), payment=(), usb=()')
  })

  test('should not override cache headers for index page', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers[CACHE_CONTROL_HEADER]).toBe('no-cache')
    expect(response.headers.expires).toBeUndefined()
    expect(response.headers.pragma).toBeUndefined()
  })

  test('should not override cache headers for assets', async () => {
    const response = await server.inject({
      url: '/assets/gov.uk-frontend.min.css'
    })
    expect(response.headers[CACHE_CONTROL_HEADER]).toBe('no-cache')
    expect(response.headers.pragma).toBeUndefined()
    expect(response.headers.expires).toBeUndefined()
  })

  test('should override cache headers for non-index pages', async () => {
    const response = await server.inject({
      url: '/home',
      auth: {
        strategy: 'session',
        credentials: {
          sessionId: 'session-id',
          scope: ['user']
        }
      }
    })
    expect(response.headers[CACHE_CONTROL_HEADER]).toBe('no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    expect(response.headers.pragma).toBe('no-cache')
    expect(response.headers.expires).toBe('0')
  })
})
