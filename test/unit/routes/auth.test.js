import routes from '../../../src/routes/auth.js'

let route

describe('auth', () => {
  beforeEach(() => {
    route = undefined
  })

  test('should return an array of routes', () => {
    expect(routes).toBeInstanceOf(Array)
  })

  describe('GET /auth/sign-in', () => {
    beforeEach(() => {
      route = routes.find(route => route.method === 'GET' && route.path === '/auth/sign-in')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should require authentication with defra identity', () => {
      expect(route.options.auth).toBe('defra-id')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-in-oidc', () => {
    beforeEach(() => {
      route = routes.find(route => route.method === 'GET' && route.path === '/auth/sign-in-oidc')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should attempt authentication with defra identity', () => {
      expect(route.options.auth.strategy).toBe('defra-id')
      expect(route.options.auth.mode).toBe('try')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-out', () => {
    beforeEach(() => {
      route = routes.find(route => route.method === 'GET' && route.path === '/auth/sign-out')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should use default authentication strategy', () => {
      expect(route.options?.auth).toBeUndefined()
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })

  describe('GET /auth/sign-out-oidc', () => {
    beforeEach(() => {
      route = routes.find(route => route.method === 'GET' && route.path === '/auth/sign-out-oidc')
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
      route = routes.find(route => route.method === 'GET' && route.path === '/auth/organisation')
    })

    test('should exist', () => {
      expect(route).toBeDefined()
    })

    test('should require authentication with defra identity', () => {
      expect(route.options.auth).toBe('defra-id')
    })

    test('should have a handler', () => {
      expect(route.handler).toBeInstanceOf(Function)
    })
  })
})
