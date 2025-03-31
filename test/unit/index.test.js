import { jest } from '@jest/globals'

const mockStart = jest.fn()
jest.unstable_mockModule('../../src/server.js', () => ({
  createServer: jest.fn(() => ({
    start: mockStart
  }))
}))

describe('start up', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await import('../../src/index.js')
  })

  test('should start the web server', async () => {
    expect(mockStart).toHaveBeenCalled()
  })
})
