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

const mockGetSignOutUrl = jest.fn()
jest.unstable_mockModule('../../../src/auth/get-sign-out-url.js', () => ({
  getSignOutUrl: mockGetSignOutUrl
}))

const mockValidateState = jest.fn()
jest.unstable_mockModule('../../../src/auth/state.js', () => ({
  validateState: mockValidateState
}))

const credentials = {
  sessionId: 'session-id',
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

const signOutUrl = 'https://oidc.example.com/sign-out'

const { createServer } = await import('../../../src/server.js')

let server
let path

describe('auth routes', () => {
  beforeAll(async () => {
    jest.clearAllMocks()

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
      mockGetPermissions.mockResolvedValue({ role, scope })
    })

    test('redirects to oidc sign in page if unauthenticated', async () => {
      const response = await server.inject({
        url: path
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location.startsWith(mockOidcConfig.authorization_endpoint)).toBe(true)
    })

    // test('should return unauthorised view if unauthenticated but redirected from Defra Identity', async () => {
    //   const response = await server.inject({
    //     url: `${path}?state=POivVXGxcRSmDcFTldSDfX&code=eyJraWQiOiJKUDVRTGEyNVlweEhNWnpMZzNsYXVpRll4NF8yV2w2b2VoWlNKQ0Z4RTU0IiwidmVyIjoiMS4wIiwiemlwIjoiRGVmbGF0ZSIsInNlciI6IjEuMCJ9.kgGAk9UnDbjBp4Vv0ZPpEmH6jNP7rk5Zs1k48uBnHInBbwf5uTCcbLr3EoxbEOi5JHiVnxnbsCCEmXY-YQ52jQn2z3zISo3uWRvuiyccvnW09cD1aEgVvUS6dJ7xIgZqYt8gJExKvLZ3EYvB94nlUsPTSslSVmxPdGzUNfJ9QiD_CV3CJQnw9yAIw_c7Rc8FJGgArOG3JTdlcb37mgd_BAZKKbU-MGMdcBsdQpBN5KvL0A5kvA98Eb_8hMaRlXY2W30yRKusteb2CLvVeeXtviPsaimO_XBwZPYKAIpFmSg5vwx-ywh_SpAmxNFw0sxhGWSW4n2BRd-IEundYhYNnA.0q5qPNM-NZ18L8vp.hWNwXFRpxLnvgMkkNv7saDkM9V5ivNrWQHlW9AhTCZhzumeltOP8W6EeGYoZoM8VlPFruiJWPb6xXwGsMeA_7r9E4ZoJQLQeUdULdR5iHyH9amJWvTx7hm2OIvrKMC6HSyB-ppD7e792JpTpsp1Hmom8O5zWRZUgVthusd8b5I3HyPMFU29DaB7cdiDTP-qgOxwAag8dngIuwfRpjg6Pvlly5qb-8FIP6eH1Z5Sl20Kz0viqk52Ef7ynHjbbv3ZAkWm18y1XPgiAi5NeToDlc46KUdEGaDj67A5qo-3xL4UkCVLMD6arPYb83KvgsK-ywa9gKsXymRR8d3kuLCzox2-TEvVhLgePTHQc_rpZMdZTaC-gTT7z_AnqYTPBwdpuSICDaxl8I6d2-iYwhG07lIgYgjfhLDqsHmOLfOMpvTx_oFgMPwsSNfhxhTg_Ce6e4DOaS6C3yFj27R0zAdox4vrjTWGrBHiJAGVDvk9PGDkkuokdUCnvfdHsr9UumE9sHforsHYIz8AWlm7GgAV7ftzW1gF9gjaGTm_N-DAShgEkP1s4WKas7gru2CYQ67Pemu0DWTYYTuQmf_g3aINrmv0jFN_H-29lTW554skQYuJRSq1bDbrSvvFNjPEMfWqGQO5f5UG3eVGf1B2UQvkN_j-ntN7NvO9BPB6odoFikN6v9iIZUJWyfyi_8-g52PrMdJVgFDuCoagTvaAhYFN62bKX8wGQlRWlJL6GYWfxbw2Np9VYu03u6p1NvdoPRQUQ86VJCLaRi4bvDRkrDNm1dqD0zAxTdnFMFZAvJamF-E56Xf2c805fGoGHuWCzDP6FD-eF0efxa8tU_os8ox3MHQw7wkWMtLZI1DvR1LHysVt8rgAf-rqogveisBY-SPKrADAvD79aCPSpdMvA2TTf-gAUjxFdZX2NLuugVxV6-cPRItmNpGH_a0iecwNxrSB1JlXKlqfwjjhFOAlvIG4J_g4.69aelVPz-m0NxM5fFZhtLw`,
    //   })
    //   console.log(response.headers.location)
    //   console.log(response.statusCode)
    //   expect(response.request.response.source.template).toBe('unauthorised')
    // })

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
      expect(sessionCookie).not.toMatch(/Expires=/)
      expect(sessionCookie).not.toMatch(/Max-Age=/)
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
  })

  describe('GET /auth/sign-out', () => {
    beforeEach(() => {
      path = '/auth/sign-out'
      mockGetSignOutUrl.mockResolvedValue(signOutUrl)
    })

    test('redirects to oidc sign out url if authenticated with session cookie', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe(signOutUrl)
    })

    test('redirects to index page if unauthenticated', async () => {
      const response = await server.inject({
        url: path
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/')
    })

    test('should return error page if unable to get sign out url', async () => {
      mockGetSignOutUrl.mockImplementationOnce(() => {
        throw new Error('Unable to get sign out url')
      })

      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      expect(response.statusCode).toBe(500)
      expect(response.request.response.source.template).toBe('500')
    })
  })

  describe('GET /auth/sign-out-oidc', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      path = '/auth/sign-out-oidc'
    })

    test('should validate state if authenticated', async () => {
      const state = 'state'
      await server.inject({
        url: `${path}?state=${state}`,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      expect(mockValidateState).toHaveBeenCalledWith(expect.anything(), state)
    })

    test('should return error page if state validation fails', async () => {
      mockValidateState.mockImplementationOnce(() => {
        throw new Error('State validation failed')
      })

      const response = await server.inject({
        url: `${path}?state=state`,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      expect(response.statusCode).toBe(500)
      expect(response.request.response.source.template).toBe('500')
    })

    test('should not validate state if unauthenticated', async () => {
      await server.inject({
        url: path
      })
      expect(mockValidateState).not.toHaveBeenCalled()
    })

    test('should clear session cache if authenticated and session id', async () => {
      await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      const cache = await server.app.cache.get(credentials.profile.sessionId)
      expect(cache).toBeNull()
    })

    test('should clear session cookie if authenticated and session id', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      const sessionCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('sid='))
      expect(sessionCookie).toBeDefined()
      expect(sessionCookie).toMatch(/Expires=/)
      expect(sessionCookie).toMatch(/Max-Age=0/)
    })

    test('should clear session cookie if authenticated and no session id', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials: {
            ...credentials,
            sessionId: null
          }
        }
      })
      const sessionCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('sid='))
      expect(sessionCookie).toBeDefined()
      expect(sessionCookie).toMatch(/Expires=/)
      expect(sessionCookie).toMatch(/Max-Age=0/)
    })

    test('should redirect to index page if authenticated', async () => {
      const response = await server.inject({
        url: path,
        auth: {
          strategy: 'session',
          credentials
        }
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/')
    })

    test('should redirect to index page if not authenticated', async () => {
      const response = await server.inject({
        url: path
      })
      expect(response.statusCode).toBe(302)
      expect(response.headers.location).toBe('/')
    })
  })

  describe('GET /auth/organisation', () => {
    beforeEach(() => {
      path = '/auth/organisation'
    })

    test('redirects to oidc sign in', async () => {
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

    test('redirects to oidc sign in with "forceReselection" parameter', async () => {
      const response = await server.inject({
        url: path
      })

      const redirect = new URL(response.headers.location)
      const params = new URLSearchParams(redirect.search)

      expect(params.get('forceReselection')).toBe('true')
    })

    test('redirects to oidc sign in with "relationshipId" parameter if preselected organisation provided', async () => {
      const response = await server.inject({
        url: `${path}?organisationId=1234567`
      })
      const redirect = new URL(response.headers.location)
      const params = new URLSearchParams(redirect.search)

      expect(params.get('relationshipId')).toBe('1234567')
    })

    test('redirects to safe redirect path if authenticated', async () => {
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
  })
})
