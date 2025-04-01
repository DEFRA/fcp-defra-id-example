import { constants } from 'http2'
import { jest } from '@jest/globals'
import '../helpers/setup-server-mocks.js'

const { HTTP_STATUS_OK } = constants

const { createServer } = await import('../../../src/server.js')

let server

describe('assets route', () => {
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

  test('GET /assets returns local asset', async () => {
    const response = await server.inject({
      url: '/assets/govuk-frontend.min.css'
    })
    expect(response.statusCode).toBe(HTTP_STATUS_OK)
  })

  test('GET /assets returns node_modules asset', async () => {
    const response = await server.inject({
      url: '/assets/images/favicon.ico'
    })
    expect(response.statusCode).toBe(HTTP_STATUS_OK)
  })
})
