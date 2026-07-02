const mockStart = vi.fn()
vi.mock('../../src/server.js', () => ({
  createServer: vi.fn(() => ({
    start: mockStart
  }))
}))

describe('start up', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await import('../../src/index.js')
  })

  test('should start the web server', async () => {
    expect(mockStart).toHaveBeenCalled()
  })
})
