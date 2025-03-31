import { jest } from '@jest/globals'
import { mockOidcConfig } from '../helpers/setup-server-mocks.js'

const mockVerifyToken = jest.fn()
jest.unstable_mockModule('../../../src/auth/verify-token', async () => ({
  verifyToken: mockVerifyToken
}))

const mockGetPermissions = jest.fn()
jest.unstable_mockModule('../../../src/auth/get-permissions.js', async () => ({
  getPermissions: mockGetPermissions
}))

const mockGetSafeRedirect = jest.fn()
jest.unstable_mockModule('../../../src/utils/get-safe-redirect.js', () => ({
  getSafeRedirect: mockGetSafeRedirect
}))

const credentials = {
  profile: {
    sessionId: 'session-id',
    crn: '1234567890',
    organisationId: '1234567'
  },
  token: 'DEFRA-ID-JWT',
  refreshToken: 'DEFRA-ID-REFRESH-TOKEN'
}

const role = 'Farmer'
const scope = ['user']

const { createServer } = await import('../../../src/server.js')

let server
let path

describe('auth routes', () => {
  beforeAll(async () => {
    jest.clearAllMocks()

    mockGetPermissions.mockResolvedValue({ role, scope })
    mockGetSafeRedirect.mockReturnValue('/home')

    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  describe('GET /auth/sign-in', () => {
    beforeEach(() => {
      path = '/auth/sign-in'
    })

    test('redirects to /home if authenticated', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/home')
    })

    test('redirects to oidc sign in if unauthenticated', async () => {
      const response = await server.inject({
        url: path
      })
      const redirect = new URL(response.headers.location)
      const params = new URLSearchParams(redirect.search)
      expect(response.statusCode).toBe(302)
      expect(redirect.origin).toBe('https://oidc.example.com')
      expect(redirect.pathname).toBe('/authorize')
      expect(params.get('serviceId')).toBe(process.env.DEFRA_ID_SERVICE_ID)
      expect(params.get('p')).toBe(process.env.DEFRA_ID_POLICY)
      expect(params.get('response_mode')).toBe('query')
      expect(params.get('client_id')).toBe(process.env.DEFRA_ID_CLIENT_ID)
      expect(params.get('response_type')).toBe('code')
      expect(params.get('redirect_uri')).toBe(process.env.DEFRA_ID_REDIRECT_URL)
      expect(params.get('state')).toBeDefined()
      expect(params.get('scope')).toBe(`openid offline_access ${process.env.DEFRA_ID_CLIENT_ID}`)
    })
  })

  describe('GET /auth/sign-in-oidc', () => {
    beforeEach(() => {
      path = '/auth/sign-in-oidc'
    })

    test('should verify JWT token against public key', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      expect(mockVerifyToken).toHaveBeenCalledWith(credentials.token)
    })

    test('should return error page if token verification fails', async () => {
      mockVerifyToken.mockImplementationOnce(() => {
        throw new Error('Token verification failed')
      })

      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      expect(response.statusCode).toBe(500)
      expect(response.request.response.source.template).toBe('500')
    })

    test('should get user permissions', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      expect(mockGetPermissions).toHaveBeenCalledWith(credentials.profile.crn, credentials.profile.organisationId, credentials.token)
    })

    test('should return error page if unable to get permissions', async () => {
      mockGetPermissions.mockImplementationOnce(() => {
        throw new Error('Unable to get permissions')
      })

      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      expect(response.statusCode).toBe(500)
      expect(response.request.response.source.template).toBe('500')
    })

    test('should set authentication status in session cache', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      const cache = await server.app.cache.get(credentials.profile.sessionId)
      expect(cache.isAuthenticated).toBe(true)
    })

    test('should set user profile properties at top level in session cache', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      const cache = await server.app.cache.get(credentials.profile.sessionId)
      expect(cache.crn).toBe(credentials.profile.crn)
      expect(cache.organisationId).toBe(credentials.profile.organisationId)
    })

    test('should set user permissions in session cache', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      const cache = await server.app.cache.get(credentials.profile.sessionId)
      expect(cache.role).toBe(role)
      expect(cache.scope).toEqual(scope)
    })

    test('should set token and refresh token in session cache', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      const cache = await server.app.cache.get(credentials.profile.sessionId)
      expect(cache.token).toBe(credentials.token)
      expect(cache.refreshToken).toBe(credentials.refreshToken)
    })

    test('should set cookie session', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      const sessionCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('sid='))
      expect(sessionCookie).toBeDefined()
    })

    test('should ensure redirect path is safe', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      expect(mockGetSafeRedirect).toHaveBeenCalledWith('/home')
    })

    test('redirects to safe redirect path', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/home')
    })

    test('redirects to oidc sign in page if unauthenticated', async () => {
      const response = await server.inject({
        url: path
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location.startsWith(mockOidcConfig.authorization_endpoint)).toBe(true)
    })
  })
})
