import { jest } from '@jest/globals'
import HapiPino from 'hapi-pino'

const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../../src/config.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

let logging

describe('logging', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    mockConfigGet.mockReturnValue(true)
    logging = await import('../../../src/plugins/logging.js')
  })

  test('should return an object', () => {
    expect(logging.default).toBeInstanceOf(Object)
  })

  test('should register the HapiPino plugin', () => {
    expect(logging.default.plugin).toBe(HapiPino)
  })

  test('should set log level to info if in development', () => {
    expect(logging.default.options.level).toBe('info')
  })

  test('should set log level to warn if not in development', async () => {
    jest.resetModules()
    mockConfigGet.mockReturnValue(false)
    logging = await import('../../../src/plugins/logging.js')
    expect(logging.default.options.level).toBe('warn')
  })
})
