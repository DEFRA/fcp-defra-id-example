import { jest } from '@jest/globals'

describe('cache config', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.REDIS_HOST = 'mockHost'
    process.env.REDIS_PORT = 6000
    process.env.REDIS_PASSWORD = 'mockPassword'
    process.env.REDIS_TLS = 'false'
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
  
})
