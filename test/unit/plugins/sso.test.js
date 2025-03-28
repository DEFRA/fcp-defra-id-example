import sso from '../../../src/plugins/sso.js'

describe('sso', () => {
  test('should return an object', () => {
    expect(sso).toBeInstanceOf(Object)
  })

  test('should name the plugin', () => {
    expect(sso.plugin.name).toBe('sso')
  })

  test('should have a register function', () => {
    expect(sso.plugin.register).toBeInstanceOf(Function)
  })
})
