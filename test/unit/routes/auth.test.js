import routes from '../../../src/routes/auth.js'

let route

describe('auth', () => {
  beforeEach(() => {
    route = null
  })

  test('should return an array of routes', () => {
    expect(routes).toBeInstanceOf(Array)
  })

  describe('GET /auth/sign-in', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/sign-in')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should require authentication with Defra Identity', () => {
      expect(route.options.auth).toBe('defra-id')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-in-oidc', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/sign-in-oidc')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should attempt authentication with Defra Identity', () => {
      expect(route.options.auth.strategy).toBe('defra-id')
      expect(route.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-out', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/sign-out')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should try and authenticate with default authentication strategy', () => {
      expect(route.options.auth.mode).toBe('try')
      expect(route.options.auth.strategy).toBeUndefined()
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-out-oidc', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/sign-out-oidc')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should attempt to authenticate with default strategy', () => {
      expect(route.options.auth.strategy).toBeUndefined()
      expect(route.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/organisation', () => {
    beforeEach(() => {
      route = getRoute('GET', '/auth/organisation')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should require authentication with Defra Identity', () => {
      expect(route.options.auth).toBe('defra-id')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })
})

function getRoute (method, path) {
  return routes.find(r => r.method === method && r.path === path)
}
