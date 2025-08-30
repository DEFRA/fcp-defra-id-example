import HapiPino from 'hapi-pino'
import logging from '../../../src/plugins/logging.js'

describe('logging', () => {
  test('should return an object', () => {
    expect(logging).toBeInstanceOf(Object)
  })

  test('should register the HapiPino plugin', () => {
    expect(logging.plugin).toBe(HapiPino)
  })

  test('should set log level to warn', () => {
    expect(logging.options.level).toBe('warn')
  })
})
