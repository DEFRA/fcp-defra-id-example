import { jest } from '@jest/globals'

describe('Defra Identity config', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env.DEFRA_ID_WELL_KNOWN_URL = 'mockWellKnownUrl'
    process.env.DEFRA_ID_CLIENT_ID = 'mockClientId'
    process.env.DEFRA_ID_CLIENT_SECRET = 'mockClientSecret'
    process.env.DEFRA_ID_SERVICE_ID = 'mockServiceId'
    process.env.DEFRA_ID_POLICY = 'mockPolicy'
    process.env.DEFRA_ID_REDIRECT_URL = 'mockRedirectUrl'
    process.env.DEFRA_ID_SIGN_OUT_REDIRECT_URL = 'mockSignOutRedirectUrl'
    process.env.DEFRA_ID_REFRESH_TOKENS = 'false'
  })

  test('should return well known url from environment variable', async () => {
    const { default: config } = await import('../../../src/config/defra-id.js')
    expect(config.get('wellKnownUrl')).toBe('mockWellKnownUrl')
  })

  test('should throw error if well known url environment variable is not set', async () => {
    delete process.env.DEFRA_ID_WELL_KNOWN_URL
    expect(async () => {
      await import('../../../src/config/defra-id.js')
    }).rejects.toThrow()
  })

  test('should return client id from environment variable', async () => {
    const { default: config } = await import('../../../src/config/defra-id.js')
    expect(config.get('clientId')).toBe('mockClientId')
  })

  test('should throw error if client id environment variable is not set', async () => {
    delete process.env.DEFRA_ID_CLIENT_ID
    expect(async () => {
      await import('../../../src/config/defra-id.js')
    }).rejects.toThrow()
  })

  test('should return client secret from environment variable', async () => {
    const { default: config } = await import('../../../src/config/defra-id.js')
    expect(config.get('clientSecret')).toBe('mockClientSecret')
  })

  test('should throw error if client secret environment variable is not set', async () => {
    delete process.env.DEFRA_ID_CLIENT_SECRET
    expect(async () => {
      await import('../../../src/config/defra-id.js')
    }).rejects.toThrow()
  })

  test('should return service id from environment variable', async () => {
    const { default: config } = await import('../../../src/config/defra-id.js')
    expect(config.get('serviceId')).toBe('mockServiceId')
  })

  test('should throw error if service id environment variable is not set', async () => {
    delete process.env.DEFRA_ID_SERVICE_ID
    expect(async () => {
      await import('../../../src/config/defra-id.js')
    }).rejects.toThrow()
  })

  test('should return policy from environment variable', async () => {
    const { default: config } = await import('../../../src/config/defra-id.js')
    expect(config.get('policy')).toBe('mockPolicy')
  })

  test('should throw error if policy environment variable is not set', async () => {
    delete process.env.DEFRA_ID_POLICY
    expect(async () => {
      await import('../../../src/config/defra-id.js')
    }).rejects.toThrow()
  })

  test('should return redirect url from environment variable', async () => {
    const { default: config } = await import('../../../src/config/defra-id.js')
    expect(config.get('redirectUrl')).toBe('mockRedirectUrl')
  })

  test('should throw error if redirect url environment variable is not set', async () => {
    delete process.env.DEFRA_ID_REDIRECT_URL
    expect(async () => {
      await import('../../../src/config/defra-id.js')
    }).rejects.toThrow()
  })

  test('should return sign out redirect url from environment variable', async () => {
    const { default: config } = await import('../../../src/config/defra-id.js')
    expect(config.get('signOutRedirectUrl')).toBe('mockSignOutRedirectUrl')
  })

  test('should throw error if sign out redirect url environment variable is not set', async () => {
    delete process.env.DEFRA_ID_SIGN_OUT_REDIRECT_URL
    expect(async () => {
      await import('../../../src/config/defra-id.js')
    }).rejects.toThrow()
  })

  test('should return refresh tokens from environment variable', async () => {
    const { default: config } = await import('../../../src/config/defra-id.js')
    expect(config.get('refreshTokens')).toBe(false)
  })

  test('should default to refreshing tokens if environment variable is not set', async () => {
    delete process.env.DEFRA_ID_REFRESH_TOKENS
    const { default: config } = await import('../../../src/config/defra-id.js')
    expect(config.get('refreshTokens')).toBe(true)
  })
})
