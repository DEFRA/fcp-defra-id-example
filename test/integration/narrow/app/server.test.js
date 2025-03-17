import { createServer } from '../../../../app/server.js'

describe('Server test', () => {
  test('createServer returns server', async () => {
    const server = await createServer()
    await server.initialize()
    expect(server).toBeDefined()
  })
})
