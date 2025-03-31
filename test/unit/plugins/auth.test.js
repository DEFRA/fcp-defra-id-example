import { jest } from '@jest/globals'
import { mockOidcConfig } from '../../integration/helpers/setup-server-mocks.js'
// import auth, { getBellOptions } from '../../../src/plugins/auth.js'

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

    test('should have a providerParams function', () => {
      expect(getBellOptions(mockOidcConfig).providerParams).toBeInstanceOf(Function)
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

      test('should include relationshipId if request query includes organisationId', () => {
        request.path = '/auth/organisation'
        request.query.organisationId = '1234567'
        expect(providerParams(request).relationshipId).toBe('1234567')
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

      test('should have a location function', () => {
        expect(getBellOptions(mockOidcConfig).location).toBeInstanceOf(Function)
      })
    })
  })
})
