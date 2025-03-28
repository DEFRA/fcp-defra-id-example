import { jest } from '@jest/globals'

const mockStart = jest.fn()
jest.unstable_mockModule('../../src/server.js', () => ({
  createServer: jest.fn(() => ({
    start: mockStart
  }))
}))

const { init } = await import('../../src/index.js')

describe('start up', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should start the web server', async () => {
    await init()
    expect(mockStart).toHaveBeenCalled()
  })
})
