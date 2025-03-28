import { jest } from '@jest/globals'

describe('cache config', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.NODE_ENV = 'test'
    process.env.REDIS_HOST = 'mockHost'
    process.env.REDIS_PORT = 6000
    process.env.REDIS_PASSWORD = 'mockPassword'
    process.env.REDIS_TTL = 1000
  })

  test('should return cache name as "redis"', async () => {
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('name')).toBe('redis')
  })

  test('should return cache host from environment variable', async () => {
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('host')).toBe('mockHost')
  })

  test('should throw error if host environment variable is not set', async () => {
    delete process.env.REDIS_HOST
    expect(async () => {
      await import('../../../src/config/cache.js')
    }).rejects.toThrow()
  })

  test('should return cache port from environment variable', async () => {
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('port')).toBe(6000)
  })

  test('should return port a 6379 if environment variable is not set', async () => {
    delete process.env.REDIS_PORT
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('port')).toBe(6379)
  })

  test('should return cache password from environment variable', async () => {
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('password')).toBe('mockPassword')
  })

  test('should return password as undefined if environment variable is not set and environment is not production', async () => {
    delete process.env.REDIS_PASSWORD
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('password')).toBeUndefined()
  })

  test('should throw error if password environment variable is not set and environment is production', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.REDIS_PASSWORD
    expect(async () => {
      await import('../../../src/config/cache.js')
    }).rejects.toThrow()
  })

  test('should return cache tls as undefined if environment is not production', async () => {
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('tls')).toBeUndefined()
  })

  test('should return cache as empty object if environment is production', async () => {
    process.env.NODE_ENV = 'production'
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('tls')).toEqual({})
  })

  test('should return cache segment as "session"', async () => {
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('segment')).toBe('session')
  })

  test('should return cache ttl from environment variable', async () => {
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('ttl')).toBe(1000)
  })

  test('should return ttl as 24 hours if environment variable is not set', async () => {
    delete process.env.REDIS_TTL
    const { default: config } = await import('../../../src/config/cache.js')
    expect(config.get('ttl')).toBe(1000 * 60 * 60 * 24)
  })
})
