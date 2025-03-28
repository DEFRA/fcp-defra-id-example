import headers from '../../../src/plugins/headers.js'

describe('headers', () => {
  test('should return an object', () => {
    expect(headers).toBeInstanceOf(Object)
  })

  test('should name the plugin', () => {
    expect(headers.plugin.name).toBe('headers')
  })

  test('should have a register function', () => {
    expect(headers.plugin.register).toBeInstanceOf(Function)
  })
})
