import errors from '../../../src/plugins/errors.js'

describe('errors', () => {
  test('should return an object', () => {
    expect(errors).toBeInstanceOf(Object)
  })

  test('should name the plugin', () => {
    expect(errors.plugin.name).toBe('errors')
  })

  test('should have a register function', () => {
    expect(errors.plugin.register).toBeInstanceOf(Function)
  })
})
