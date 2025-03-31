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

describe('auth routes', () => {
  beforeAll(async () => {
    jest.clearAllMocks()

    mockGetPermissions.mockResolvedValue({ role, scope })

    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    if (server) {
      await server.stop()
    }
  })

  describe('GET /auth/sign-in', () => {
    test('redirects to /home if authenticated', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/auth/sign-in',
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
        method: 'GET',
        url: '/auth/sign-in'
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
    test('redirects to /home if authenticated and no redirect path in session', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/auth/sign-in-oidc',
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/home')
    })

    test('should verify JWT token against public key', async () => {
      await server.inject({
        method: 'GET',
        url: '/auth/sign-in-oidc',
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
        method: 'GET',
        url: '/auth/sign-in-oidc',
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
        method: 'GET',
        url: '/auth/sign-in-oidc',
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
        method: 'GET',
        url: '/auth/sign-in-oidc',
        auth: {
          strategy: 'defra-id',
          credentials
        }
      })
      expect(response.statusCode).toBe(500)
      expect(response.request.response.source.template).toBe('500')
    })

    test('redirects to oidc sign in page if unauthenticated and no redirect params', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/auth/sign-in-oidc'
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location.startsWith(mockOidcConfig.authorization_endpoint)).toBe(true)
    })

    // test('returns unauthorised view if not authenticated but redirect params', async () => {
    //   const response = await server.inject({
    //     method: 'GET',
    //     url: '/auth/sign-in-oidc?state=state&code=code'
    //   })
    //   console.log(response.payload)
    //   expect(response.statusCode).toBe(200)
    //   expect(response.request.response.source.template).toBe('unauthorised')
    // })
  })
})
