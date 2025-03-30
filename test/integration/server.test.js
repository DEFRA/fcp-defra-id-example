import './helpers/setup-server-mocks.js'

const { createServer } = await import('../../src/server')

let server

describe('server', () => {
  beforeEach(async () => {
    server = await createServer()
  })

  afterEach(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('starts successfully', async () => {
    await server.initialize()
  })
})
