import { jest } from '@jest/globals'
import defraId from '../../../src/config/defra-id.js'
import cache from '../../../src/config/cache.js'

describe('Defra Identity config', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.NODE_ENV = 'test'
    process.env.HOST = '127.0.0.1'
    process.env.PORT = 4000
    process.env.COOKIE_PASSWORD = 'mockCookiePassword'
  })

  test('should return well known url from environment variable', async () => {
    const { default: config } = await import('../../../src/config/index.js')
    expect(config.get('env')).toBe('test')
  })

  test('should default to development if environment variable is not set', async () => {
    delete process.env.NODE_ENV
    const { default: config } = await import('../../../src/config/index.js')
    expect(config.get('env')).toBe('development')
  })

  test('should return host from environment variable', async () => {
    const { default: config } = await import('../../../src/config/index.js')
    expect(config.get('host')).toBe('127.0.0.1')
  })

  test('should default host to "0.0.0.0" if environment variable is not set', async () => {
    delete process.env.HOST
    const { default: config } = await import('../../../src/config/index.js')
    expect(config.get('host')).toBe('0.0.0.0')
  })

  test('should return port from environment variable', async () => {
    const { default: config } = await import('../../../src/config/index.js')
    expect(config.get('port')).toBe(4000)
  })

  test('should default port to 3000 if environment variable is not set', async () => {
    delete process.env.PORT
    const { default: config } = await import('../../../src/config/index.js')
    expect(config.get('port')).toBe(3000)
  })

  test('should return cookie password from environment variable', async () => {
    const { default: config } = await import('../../../src/config/index.js')
    expect(config.get('cookie.password')).toBe('mockCookiePassword')
  })

  test('should throw error if cookie password environment variable is not set', async () => {
    delete process.env.COOKIE_PASSWORD
    expect(async () => {
      await import('../../../src/config/index.js')
    }).rejects.toThrow()
  })

  test('should include Defra Id config', async () => {
    const { default: config } = await import('../../../src/config/index.js')
    expect(config.get('defraId')).toEqual(defraId.getProperties())
  })

  test('should include cache config', async () => {
    const { default: config } = await import('../../../src/config/index.js')
    expect(config.get('cache')).toEqual(cache.getProperties())
  })
})
