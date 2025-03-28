import router from '../../../src/plugins/router.js'

describe('router', () => {
  test('should return an object', () => {
    expect(router).toBeInstanceOf(Object)
  })

  test('should name the plugin', () => {
    expect(router.plugin.name).toBe('router')
  })

  test('should have a register function', () => {
    expect(router.plugin.register).toBeInstanceOf(Function)
  })
})
