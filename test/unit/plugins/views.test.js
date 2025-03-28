import { jest } from '@jest/globals'
import Vision from '@hapi/vision'

const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../../src/config.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

let views

describe('views', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    mockConfigGet.mockReturnValue(true)
    views = await import('../../../src/plugins/views.js')
  })

  test('should return an object', () => {
    expect(views.default).toBeInstanceOf(Object)
  })

  test('should register the Vision plugin', () => {
    expect(views.default.plugin).toBe(Vision)
  })

  test('should configure a nunjucks template engine', () => {
    expect(views.default.options.engines.njk).toBeInstanceOf(Object)
  })

  test('should set compile function on nunjucks engine', () => {
    expect(views.default.options.engines.njk.compile).toBeInstanceOf(Function)
  })

  test('should set prepare function on nunjucks engine', () => {
    expect(views.default.options.engines.njk.prepare).toBeInstanceOf(Function)
  })

  test('should set relative path to the views directory', () => {
    expect(views.default.options.path).toBe('../views')
  })

  test('should specify that the views directory path is relative to the plugins directory', () => {
    expect(views.default.options.relativeTo).toMatch(/src\/plugins$/)
  })

  test('should not cache templates if in development', () => {
    expect(views.default.options.isCached).toBe(false)
  })

  test('should cache templates if not in development', async () => {
    jest.resetModules()
    mockConfigGet.mockReturnValue(false)
    views = await import('../../../src/plugins/views.js')
    expect(views.default.options.isCached).toBe(true)
  })

  test('should set the context as a function', () => {
    expect(views.default.options.context).toBeInstanceOf(Function)
  })
})
