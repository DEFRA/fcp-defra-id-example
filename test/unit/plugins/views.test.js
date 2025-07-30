import { jest } from '@jest/globals'
import Vision from '@hapi/vision'

const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../../src/config/index.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

const mockCacheGet = jest.fn()

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

  describe('compile', () => {
    const src = '<!DOCTYPE html><html lang="en"><head></head><body><h1>Title</h1></body></html>'
    const options = { environment: {} }

    let compile

    beforeEach(() => {
      compile = views.default.options.engines.njk.compile
    })

    test('should return a function', () => {
      const compiled = compile(src, options)
      expect(compiled).toBeInstanceOf(Function)
    })

    test('should return a function that renders the template', () => {
      const compiled = compile(src, options)
      const result = compiled()
      expect(result).toBe(src)
    })
  })

  describe('prepare', () => {
    const options = {
      relativeTo: 'relative/to/dir',
      path: 'path/to/views',
      compileOptions: {}
    }
    const next = jest.fn()

    let prepare

    beforeEach(() => {
      prepare = views.default.options.engines.njk.prepare
    })

    test('should call the next function', () => {
      prepare(options, next)
      expect(next).toHaveBeenCalled()
    })

    test('should set the compileOptions.environment property', () => {
      prepare(options, next)
      expect(options.compileOptions.environment).toBeDefined()
    })
  })

  describe('context', () => {
    const session = {
      name: 'A Farmer',
      isAuthenticated: true,
      scope: ['user']
    }

    let request

    beforeEach(() => {
      request = {
        auth: {
          isAuthenticated: true,
          credentials: {
            sessionId: 'sessionId'
          }
        },
        server: {
          app: {
            cache: {
              get: mockCacheGet
            }
          }
        },
        response: {
          source: {
            context: {}
          }
        }
      }

      mockCacheGet.mockResolvedValue(session)
    })

    test('should return an empty object if not authenticated', async () => {
      request.auth.isAuthenticated = false
      const context = await views.default.options.context(request)
      expect(context).toEqual({})
    })

    test('should return all session data to auth context', async () => {
      const context = await views.default.options.context(request)
      expect(context).toEqual({ auth: session })
    })
  })
})
