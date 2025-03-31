import { generateKeyPairSync } from 'crypto'
import { jest } from '@jest/globals'
import { mockOidcConfig } from '../../integration/helpers/setup-server-mocks.js'
import Jwt from '@hapi/jwt'

const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../../src/config/index.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

const { default: auth, getBellOptions } = await import('../../../src/plugins/auth.js')

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

        const jwtSpy = jest.spyOn(Jwt.token, 'decode')

        const profile = getBellOptions(mockOidcConfig).provider.profile
        const token = {
          contactId: '1234567890',
          firstName: 'Andrew',
          lastName: 'Farmer',
          currentRelationshipId: '1234567',
          sessionId: 'session-id'
        }

        let credentials
        let encodedToken

        beforeEach(() => {
          jest.clearAllMocks()
          encodedToken = Jwt.token.generate(token, { key: privateKey, algorithm: 'RS256' })
          credentials = { token: encodedToken }
        })

        test('should decode token provide from Defra Identity', () => {
          profile(credentials)
          expect(jwtSpy).toHaveBeenCalledWith(credentials.token)
        })

        test('should throw error if token is not provided', () => {
          credentials.token = null
          expect(() => profile(credentials)).toThrow()
        })

        test('should throw error if Jwt library throws error', () => {
          jwtSpy.mockImplementationOnce(() => {
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
})
