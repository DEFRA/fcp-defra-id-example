import { jest } from '@jest/globals'
import Hapi from '@hapi/hapi'
import { Engine as CatboxRedis } from '@hapi/catbox-redis'

const mockRegisterPlugins = jest.fn()
jest.unstable_mockModule('../../src/plugins/index.js', () => ({
  registerPlugins: mockRegisterPlugins
}))

const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../src/config/index.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

const hapiSpy = jest.spyOn(Hapi, 'server')

const { createServer } = await import('../../src/server.js')

describe('hapi server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConfigGet.mockImplementation((key) => {
      switch (key) {
        case 'host':
          return '0.0.0.0'
        case 'port':
          return 3000
        case 'cache.name':
          return 'redis'
        case 'cache.host':
          return 'mockHost'
        case 'cache.port':
          return 6379
        case 'cache.password':
          return 'mockPassword'
        case 'cache.tls':
          return {}
        case 'cache.segment':
          return 'mockSegment'
        case 'cache.ttl':
          return 1000
        default:
          return 'defaultConfigValue'
      }
    })
  })

  test('should return a server instance', async () => {
    const server = await createServer()
    expect(server).toBeDefined()
  })

  test('should be a hapi server', async () => {
    await createServer()
    expect(hapiSpy).toHaveBeenCalled()
  })

  test('should listen on host from config', async () => {
    await createServer()
    expect(hapiSpy).toHaveBeenCalledWith(expect.objectContaining({ host: '0.0.0.0' }))
  })

  test('should listen on port from config', async () => {
    await createServer()
    expect(hapiSpy).toHaveBeenCalledWith(expect.objectContaining({ port: 3000 }))
  })

  test('should not complete route validation in full', async () => {
    const server = await createServer()
    expect(server.settings.routes.validate.options.abortEarly).toBe(false)
  })

  test('should strip trailing slashes from route requests', async () => {
    const server = await createServer()
    expect(server.settings.router.stripTrailingSlash).toBe(true)
  })

  test('should setup cache configuration array with single cache', async () => {
    await createServer()
    expect(hapiSpy).toHaveBeenCalledWith(expect.objectContaining({ cache: expect.any(Array) }))
    expect(hapiSpy.mock.calls[0][0].cache.length).toBe(1)
  })

  test('should setup cache with name from config', async () => {
    await createServer()
    expect(hapiSpy.mock.calls[0][0].cache[0].name).toBe('redis')
  })

  test('should setup cache with CatboxRedis provider', async () => {
    await createServer()
    expect(hapiSpy.mock.calls[0][0].cache[0].provider.constructor).toBe(CatboxRedis)
  })

  test('should setup cache with host from config', async () => {
    await createServer()
    expect(hapiSpy.mock.calls[0][0].cache[0].provider.options.host).toBe('mockHost')
  })

  test('should setup cache with port from config', async () => {
    await createServer()
    expect(hapiSpy.mock.calls[0][0].cache[0].provider.options.port).toBe(6379)
  })

  test('should setup cache with password from config', async () => {
    await createServer()
    expect(hapiSpy.mock.calls[0][0].cache[0].provider.options.password).toBe('mockPassword')
  })

  test('should setup cache with tls from config', async () => {
    await createServer()
    expect(hapiSpy.mock.calls[0][0].cache[0].provider.options.tls).toEqual({})
  })

  test('should setup cache and add to server app', async () => {
    const server = await createServer()
    expect(server.app.cache).toBeDefined()
  })

  test('should get cache config from config', async () => {
    await createServer()
    expect(mockConfigGet).toHaveBeenCalledWith('cache.name')
    expect(mockConfigGet).toHaveBeenCalledWith('cache.segment')
    expect(mockConfigGet).toHaveBeenCalledWith('cache.ttl')
  })

  test('should register plugins', async () => {
    await createServer()
    expect(mockRegisterPlugins).toHaveBeenCalled()
  })
})
