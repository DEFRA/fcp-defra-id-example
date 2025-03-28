import route from '../../../src/routes/home.js'

describe('home', () => {
  test('should return an object', () => {
    expect(route).toBeInstanceOf(Object)
  })

  test('should return GET /home route', () => {
    expect(route.method).toBe('GET')
    expect(route.path).toBe('/home')
  })

  test('should use default authentication strategy', () => {
    expect(route.options.auth.strategy).toBeUndefined()
  })

  test('should restrict access to users with the "user" scope', () => {
    expect(route.options.auth.scope).toEqual(['user'])
  })

  test('should have a handler', () => {
    expect(route.handler).toBeInstanceOf(Function)
  })
})
