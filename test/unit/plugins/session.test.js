import { jest } from '@jest/globals'
import Yar from '@hapi/yar'

const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../../src/config/index.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

let session

describe('session', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    mockConfigGet.mockImplementation((key) => {
      switch (key) {
        case 'cache.name':
          return 'mockCacheName'
        case 'cache.segment':
          return 'mockCacheSegment'
        case 'cookie.password':
          return 'mockCookiePassword'
        case 'isDev':
          return true
        default:
          return 'defaultConfigValue'
      }
    })
    session = await import('../../../src/plugins/session.js')
  })

  test('should return an object', () => {
    expect(session.default).toBeInstanceOf(Object)
  })

  test('should register the Yar plugin', () => {
    expect(session.default.plugin).toBe(Yar)
  })

  test('should no create cookie if no data is set', () => {
    expect(session.default.options.storeBlank).toBe(false)
  })

  test('should always store data server side', () => {
    expect(session.default.options.maxCookieSize).toBe(0)
  })

  test('should set cache name from config', () => {
    expect(session.default.options.cache.cache).toBe('mockCacheName')
  })

  test('should set cache segment from config suffixed with -temp', () => {
    expect(session.default.options.cache.segment).toBe('mockCacheSegment-temp')
  })

  test('should set cookie password from config', () => {
    expect(session.default.options.cookieOptions.password).toBe('mockCookiePassword')
  })

  test('should set insecure cookie if in development', () => {
    expect(session.default.options.cookieOptions.isSecure).toBe(false)
  })

  test('should set secure cookie if not in development', async () => {
    jest.resetModules()
    mockConfigGet.mockReturnValue(false)
    session = await import('../../../src/plugins/session.js')
    expect(session.default.options.cookieOptions.isSecure).toBe(true)
  })

  test('should set SameSite cookie to Lax', () => {
    expect(session.default.options.cookieOptions.isSameSite).toBe('Lax')
  })
})
