import route from '../../../src/routes/index.js'

describe('index', () => {
  test('should return an object', () => {
    expect(route).toBeInstanceOf(Object)
  })

  test('should return GET / route', () => {
    expect(route.method).toBe('GET')
    expect(route.path).toBe('/')
  })

  test('should try and authenticate using default strategy', () => {
    expect(route.options.auth.strategy).toBeUndefined()
    expect(route.options.auth.mode).toBe('try')
  })

  test('should have a handler', () => {
    expect(route.handler).toBeInstanceOf(Function)
  })
})
