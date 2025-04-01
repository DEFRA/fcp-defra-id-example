import { generateKeyPairSync } from 'crypto'
import { jest } from '@jest/globals'
import { mockOidcConfig } from '../../integration/helpers/setup-server-mocks.js'
import Jwt from '@hapi/jwt'

const jwtDecodeSpy = jest.spyOn(Jwt.token, 'decode')
const jwtVerifyTimeSpy = jest.spyOn(Jwt.token, 'verifyTime')

const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../../src/config/index.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

const mockGetSafeRedirect = jest.fn()
jest.unstable_mockModule('../../../src/utils/get-safe-redirect.js', () => ({
  getSafeRedirect: mockGetSafeRedirect
}))

const mockRefreshTokens = jest.fn()
jest.unstable_mockModule('../../../src/auth/refresh-tokens.js', () => ({
  refreshTokens: mockRefreshTokens
}))

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'jwk'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
})

const token = {
  contactId: '1234567890',
  firstName: 'Andrew',
  lastName: 'Farmer',
  currentRelationshipId: '1234567',
  sessionId: 'session-id'
}

const refreshToken = 'DEFRA-ID-REFRESH-TOKEN'

const { default: auth, getBellOptions, getCookieOptions } = await import('../../../src/plugins/auth.js')

describe('auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockConfigGet.mockImplementation((key) => {
      switch (key) {
        case 'defraId.clientId':
          return 'mockClientId'
        case 'defraId.clientSecret':
          return 'mockClientSecret'
        case 'defraId.serviceId':
          return 'mockServiceId'
        case 'defraId.policy':
          return 'mockPolicy'
        case 'defraId.redirectUrl':
          return 'mockRedirectUrl'
        case 'defraId.refreshTokens':
          return true
        case 'cookie.password':
          return 'mockPassword'
        case 'isProd':
          return true
        default:
          return 'defaultConfigValue'
      }
    })
  })

  test('should return an object', () => {
    expect(auth).toBeInstanceOf(Object)
  })

  test('should name the plugin', () => {
    expect(auth.plugin.name).toBe('auth')
  })

  test('should have a register function', () => {
    expect(auth.plugin.register).toBeInstanceOf(Function)
  })

  describe('getBellOptions', () => {
    test('should return an object', () => {
      expect(getBellOptions(mockOidcConfig)).toBeInstanceOf(Object)
    })

    test('should set client id from config', () => {
      expect(getBellOptions(mockOidcConfig).clientId).toBe('mockClientId')
    })

    test('should set client secret from config', () => {
      expect(getBellOptions(mockOidcConfig).clientSecret).toBe('mockClientSecret')
    })

    test('should set cookie password from config', () => {
      expect(getBellOptions(mockOidcConfig).password).toBe('mockPassword')
    })

    test('should set isSecure from config', () => {
      expect(getBellOptions(mockOidcConfig).isSecure).toBe(true)
    })

    test('should have a location function', () => {
      expect(getBellOptions(mockOidcConfig).location).toBeInstanceOf(Function)
    })

    test('should have a providerParams function', () => {
      expect(getBellOptions(mockOidcConfig).providerParams).toBeInstanceOf(Function)
    })

    describe('location', () => {
      const location = getBellOptions(mockOidcConfig).location
      let request

      beforeEach(() => {
        jest.clearAllMocks()
        mockGetSafeRedirect.mockReturnValue('/home')
        request = {
          query: {},
          yar: {
            set: jest.fn()
          }
        }
      })

      test('should return redirectUrl from config', () => {
        expect(location(request)).toBe('mockRedirectUrl')
      })

      test('should check redirect link is safe if redirect query param is present', () => {
        request.query.redirect = '/redirect'
        location(request)
        expect(mockGetSafeRedirect).toHaveBeenCalledWith('/redirect')
      })

      test('should set safe redirect path in session if redirect query param is present', () => {
        request.query.redirect = '/redirect'
        location(request)
        expect(request.yar.set).toHaveBeenCalledWith('redirect', '/home')
      })
    })

    describe('providerParams', () => {
      const providerParams = getBellOptions(mockOidcConfig).providerParams
      let request

      beforeEach(() => {
        request = { query: {} }
      })

      test('should return an object', () => {
        expect(providerParams(request)).toBeInstanceOf(Object)
      })

      test('should include serviceId from config', () => {
        expect(providerParams(request).serviceId).toBe('mockServiceId')
      })

      test('should include policy from config', () => {
        expect(providerParams(request).p).toBe('mockPolicy')
      })

      test('should include response_mode as query', () => {
        expect(providerParams(request).response_mode).toBe('query')
      })

      test('should include forceReselection if request path is /auth/organisation', () => {
        request.path = '/auth/organisation'
        expect(providerParams(request).forceReselection).toBe(true)
      })

      test('should include relationshipId if request path is /auth/organisation and query includes organisationId', () => {
        request.path = '/auth/organisation'
        request.query.organisationId = '1234567'
        expect(providerParams(request).relationshipId).toBe('1234567')
      })

      test('should not include relationshipId if request path is not /auth/organisation and query includes organisationId', () => {
        request.path = '/some/other/path'
        request.query.organisationId = '1234567'
        expect(providerParams(request).relationshipId).toBeUndefined()
      })
    })

    describe('provider', () => {
      test('should be an object', () => {
        expect(getBellOptions(mockOidcConfig).provider).toBeInstanceOf(Object)
      })

      test('should be named "defra-id"', () => {
        expect(getBellOptions(mockOidcConfig).provider.name).toBe('defra-id')
      })

      test('should use oauth2 protocol', () => {
        expect(getBellOptions(mockOidcConfig).provider.protocol).toBe('oauth2')
      })

      test('should use params auth', () => {
        expect(getBellOptions(mockOidcConfig).provider.useParamsAuth).toBe(true)
      })

      test('should use authorization endpoint from oidc config', () => {
        expect(getBellOptions(mockOidcConfig).provider.auth).toBe(mockOidcConfig.authorization_endpoint)
      })

      test('should use token endpoint from oidc config', () => {
        expect(getBellOptions(mockOidcConfig).provider.token).toBe(mockOidcConfig.token_endpoint)
      })

      test('should create a scope array', () => {
        expect(getBellOptions(mockOidcConfig).provider.scope).toEqual(['openid', 'offline_access', 'mockClientId'])
      })

      test('should have a profile function', () => {
        expect(getBellOptions(mockOidcConfig).provider.profile).toBeInstanceOf(Function)
      })

      describe('profile', () => {
        const profile = getBellOptions(mockOidcConfig).provider.profile

        let credentials
        let encodedToken

        beforeEach(() => {
          jest.clearAllMocks()
          encodedToken = Jwt.token.generate(token, { key: privateKey, algorithm: 'RS256' })
          credentials = { token: encodedToken }
        })

        test('should decode token provide from Defra Identity', () => {
          profile(credentials)
          expect(jwtDecodeSpy).toHaveBeenCalledWith(credentials.token)
        })

        test('should throw error if token is not provided', () => {
          credentials.token = null
          expect(() => profile(credentials)).toThrow()
        })

        test('should throw error if Jwt library throws error', () => {
          jwtDecodeSpy.mockImplementationOnce(() => {
            throw new Error('Test error')
          })
          expect(() => profile(credentials)).toThrow('Test error')
        })

        test('should populate credentials profile with decoded token payload', () => {
          profile(credentials)
          expect(credentials.profile).toMatchObject({ ...token })
        })

        test('should add crn property to credentials profile', () => {
          profile(credentials)
          expect(credentials.profile.crn).toBe(token.contactId)
        })

        test('should add name property to credentials profile', () => {
          profile(credentials)
          expect(credentials.profile.name).toBe(`${token.firstName} ${token.lastName}`)
        })

        test('should add organisationId property to credentials profile', () => {
          profile(credentials)
          expect(credentials.profile.organisationId).toBe(token.currentRelationshipId)
        })
      })
    })
  })

  describe('getCookieOptions', () => {
    test('should return an object', () => {
      expect(getCookieOptions()).toBeInstanceOf(Object)
    })

    test('should return a cookie object', () => {
      expect(getCookieOptions().cookie).toBeInstanceOf(Object)
    })

    test('should return a redirectTo function', () => {
      expect(getCookieOptions().redirectTo).toBeInstanceOf(Function)
    })

    test('should return a validate function', () => {
      expect(getCookieOptions().validate).toBeInstanceOf(Function)
    })

    describe('cookie', () => {
      test('should set cookie password from config', () => {
        expect(getCookieOptions().cookie.password).toBe('mockPassword')
      })

      test('should set cookie path to root', () => {
        expect(getCookieOptions().cookie.path).toBe('/')
      })

      test('should set isSecure from config', () => {
        expect(getCookieOptions().cookie.isSecure).toBe(true)
      })

      test('should set isSameSite to Lax', () => {
        expect(getCookieOptions().cookie.isSameSite).toBe('Lax')
      })
    })

    describe('redirectTo', () => {
      const redirectTo = getCookieOptions().redirectTo
      const request = {
        url: {
          pathname: '/home',
          search: '?query=string'
        }
      }

      test('should redirect to sign-in route', () => {
        expect(redirectTo(request).startsWith('/auth/sign-in')).toBe(true)
      })

      test('should include redirect param in redirection to intended path', () => {
        expect(redirectTo(request)).toContain('redirect=/home?query=string')
      })
    })

    describe('validate', () => {
      const validate = getCookieOptions().validate
      const mockCacheGet = jest.fn()
      const mockCacheSet = jest.fn()
      const request = {
        server: {
          app: {
            cache: {
              get: mockCacheGet,
              set: mockCacheSet
            }
          }
        }
      }
      const session = {
        sessionId: 'session-id',
        refreshToken
      }

      let userSession

      beforeEach(() => {
        jest.clearAllMocks()
        const encodedToken = Jwt.token.generate(token, { key: privateKey, algorithm: 'RS256' })
        session.token = encodedToken

        userSession = {
          token: encodedToken,
          refreshToken
        }

        mockRefreshTokens.mockResolvedValue({
          access_token: encodedToken,
          refresh_token: refreshToken
        })

        mockCacheGet.mockResolvedValue(userSession)
      })

      test('should return an object', async () => {
        const result = await validate(request, session)
        expect(result).toBeInstanceOf(Object)
      })

      test('should get session from cache', async () => {
        await validate(request, session)
        expect(mockCacheGet).toHaveBeenCalledWith(session.sessionId)
      })

      test('should decode token from session', async () => {
        await validate(request, session)
        expect(jwtDecodeSpy).toHaveBeenCalledWith(session.token)
      })

      test('should verify token time', async () => {
        await validate(request, session)
        expect(jwtVerifyTimeSpy).toHaveBeenCalled()
      })

      test('should return valid state if session exists and token is valid', async () => {
        const result = await validate(request, session)
        expect(result.isValid).toBe(true)
      })

      test('should add credentials as session data to request if session exists and token is valid', async () => {
        const result = await validate(request, session)
        expect(result.credentials).toEqual(userSession)
      })

      test('should return invalid state if session does not exist', async () => {
        mockCacheGet.mockResolvedValue(null)
        const result = await validate(request, session)
        expect(result.isValid).toBe(false)
      })

      test('should return invalid state if token has expired and refresh tokens are disabled', async () => {
        jwtVerifyTimeSpy.mockImplementationOnce(() => {
          throw new Error('Token has expired')
        })
        mockConfigGet.mockReturnValueOnce(false)
        const result = await validate(request, session)
        expect(result.isValid).toBe(false)
      })

      test('should refresh tokens if token is has expired and refresh tokens are enabled', async () => {
        jwtVerifyTimeSpy.mockImplementationOnce(() => {
          throw new Error('Token has expired')
        })
        await validate(request, session)
        expect(mockRefreshTokens).toHaveBeenCalledWith(refreshToken)
      })

      test('should overwrite session data in cache if tokens are refreshed', async () => {
        jwtVerifyTimeSpy.mockImplementationOnce(() => {
          throw new Error('Token has expired')
        })
        await validate(request, session)
        expect(mockCacheSet).toHaveBeenCalledWith(session.sessionId, userSession)
      })

      test('should return valid state if tokens are refreshed', async () => {
        jwtVerifyTimeSpy.mockImplementationOnce(() => {
          throw new Error('Token has expired')
        })
        const result = await validate(request, session)
        expect(result.isValid).toBe(true)
      })
    })
  })
})
