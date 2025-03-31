import { jest } from '@jest/globals'
import '../helpers/setup-server-mocks.js'

const { createServer } = await import('../../../src/server.js')

let server

describe('content security policy', () => {
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
  test('should include content security policy header', async () => {
    const response = await server.inject({
      url: '/'
    })
    expect(response.headers['content-security-policy']).toBe("base-uri 'self';connect-src 'self';default-src 'none';font-src 'self';form-action 'self';frame-ancestors 'self';img-src 'self';script-src 'self' 'unsafe-inline';style-src 'self' 'unsafe-inline';worker-src 'self'")
  })
})
