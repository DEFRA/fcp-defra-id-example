import { jest } from '@jest/globals'

const mockOidcConfig = { token_endpoint: 'https://example.com/token' }
const mockGetOidcConfig = jest.fn()
jest.unstable_mockModule('../../../src/auth/get-oidc-config.js', () => ({
  getOidcConfig: mockGetOidcConfig
}))

const mockWreckPost = jest.fn()
const mockTokenPayload = { access_token: 'DEFRA_ID_JWT', refresh_token: 'DEFRA_ID_REFRESH_TOKEN_NEW' }
jest.unstable_mockModule('@hapi/wreck', () => ({
  default: {
    post: mockWreckPost
  }
}))

const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../../src/config.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

const { refreshTokens } = await import('../../../src/auth/refresh-tokens.js')

const refreshToken = 'DEFRA_ID_REFRESH_TOKEN'

describe('refreshTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetOidcConfig.mockResolvedValue(mockOidcConfig)
    mockWreckPost.mockResolvedValue({ payload: mockTokenPayload })
    mockConfigGet.mockImplementation((key) => {
      switch (key) {
        case 'defraId.clientId':
          return 'mockClientId'
        case 'defraId.clientSecret':
          return 'mockClientSecret'
        case 'defraId.redirectUrl':
          return 'https://mock-redirect-url.com'
        default:
          return 'defaultConfigValue'
      }
    })
  })

  test('should get oidc config', async () => {
    await refreshTokens(refreshToken)
    expect(mockGetOidcConfig).toHaveBeenCalled()
  })

  test('should get client id from config', async () => {
    await refreshTokens(refreshToken)
    expect(mockConfigGet).toHaveBeenCalledWith('defraId.clientId')
  })

  test('should get client secret from config', async () => {
    await refreshTokens(refreshToken)
    expect(mockConfigGet).toHaveBeenCalledWith('defraId.clientSecret')
  })

  test('should get redirect url from config', async () => {
    await refreshTokens(refreshToken)
    expect(mockConfigGet).toHaveBeenCalledWith('defraId.redirectUrl')
  })

  test('should make api post request to token endpoint host', async () => {
    await refreshTokens(refreshToken)
    const url = new URL(mockWreckPost.mock.calls[0][0])
    expect(url.origin).toBe('https://example.com')
  })

  test('should make api post request to token endpoint path', async () => {
    await refreshTokens(refreshToken)
    const url = new URL(mockWreckPost.mock.calls[0][0])
    expect(url.pathname).toBe('/token')
  })

  test('should make api post request to token endpoint with query string', async () => {
    await refreshTokens(refreshToken)
    const url = new URL(mockWreckPost.mock.calls[0][0])
    expect(url.searchParams.get('client_id')).toBe('mockClientId')
    expect(url.searchParams.get('client_secret')).toBe('mockClientSecret')
    expect(url.searchParams.get('grant_type')).toBe('refresh_token')
    expect(url.searchParams.get('scope')).toBe('openid offline_access mockClientId')
    expect(url.searchParams.get('refresh_token')).toBe(refreshToken)
    expect(url.searchParams.get('redirect_uri')).toBe('https://mock-redirect-url.com')
  })

  test('should make api post request to token endpoint with content type header', async () => {
    await refreshTokens(refreshToken)
    expect(mockWreckPost.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' })
  })

  test('should make api post request to token endpoint and parse response to json', async () => {
    await refreshTokens(refreshToken)
    expect(mockWreckPost.mock.calls[0][1].json).toBeTruthy()
  })

  test('should return the payload from the API response', async () => {
    const result = await refreshTokens(refreshToken)
    expect(result).toBe(mockTokenPayload)
  })

  test('should throw error if get oidc config fails', async () => {
    mockGetOidcConfig.mockRejectedValue(new Error('Test error'))
    await expect(refreshTokens(refreshToken)).rejects.toThrow('Test error')
  })

  test('should throw an error if the api request fails', async () => {
    mockWreckPost.mockRejectedValue(new Error('Test error'))
    await expect(refreshTokens(refreshToken)).rejects.toThrow('Test error')
  })
})
