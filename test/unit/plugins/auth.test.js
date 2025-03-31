import { jest } from '@jest/globals'
import { mockOidcConfig } from '../../integration/helpers/setup-server-mocks.js'
import auth, { getBellOptions } from '../../../src/plugins/auth.js'

const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../../src/config/index.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

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
    })
  })
})
