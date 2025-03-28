import auth from '../../../src/plugins/auth.js'

describe('auth', () => {
  test('should return an object', () => {
    expect(auth).toBeInstanceOf(Object)
  })

  test('should name the plugin', () => {
    expect(auth.plugin.name).toBe('auth')
  })

  test('should have a register function', () => {
    expect(auth.plugin.register).toBeInstanceOf(Function)
  })
})
