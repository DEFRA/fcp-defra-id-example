import { jest } from '@jest/globals'

const mockOidcConfig = { end_session_endpoint: 'https://example.com/sign-out' }
const mockGetOidcConfig = jest.fn()
jest.unstable_mockModule('../../../src/auth/get-oidc-config.js', () => ({
  getOidcConfig: mockGetOidcConfig
}))

const mockCreateState = jest.fn()
jest.unstable_mockModule('../../../src/auth/state.js', () => ({
  createState: mockCreateState
}))

const mockSignOutRedirectUrl = 'https://example.com/sign-out-redirect'
const mockConfigGet = jest.fn()
jest.unstable_mockModule('../../../src/config/index.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

const { getSignOutUrl } = await import('../../../src/auth/get-sign-out-url.js')

const request = { mock: 'request' }
const token = 'DEFRA-ID-JWT'

describe('getSignOutUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetOidcConfig.mockResolvedValue(mockOidcConfig)
    mockConfigGet.mockReturnValue(mockSignOutRedirectUrl)
    mockCreateState.mockReturnValue('mock-state')
  })

  test('should get oidc config', async () => {
    await getSignOutUrl(request, token)
    expect(mockGetOidcConfig).toHaveBeenCalled()
  })

  test('should create state from request', async () => {
    await getSignOutUrl(request, token)
    expect(mockCreateState).toHaveBeenCalledWith(request)
  })

  test('should get redirect url from config', async () => {
    await getSignOutUrl(request, token)
    expect(mockConfigGet).toHaveBeenCalledWith('defraId.signOutRedirectUrl')
  })

  test('should return url with post_logout_redirect_uri as sign out url from config', async () => {
    const result = await getSignOutUrl(request, token)
    expect(result).toContain(`post_logout_redirect_uri=${mockSignOutRedirectUrl}`)
  })

  test('should return url with id_token_hint token', async () => {
    const result = await getSignOutUrl(request, token)
    expect(result).toContain(`id_token_hint=${token}`)
  })

  test('should return url with created state', async () => {
    const result = await getSignOutUrl(request, token)
    expect(result).toContain('state=mock-state')
  })

  test('should return url with all parameters encoded', async () => {
    mockCreateState.mockReturnValue('mock state')
    const result = await getSignOutUrl(request, token)
    expect(result).toContain('state=mock%20state')
  })

  test('should return all properties in correctly formatted url', async () => {
    const result = await getSignOutUrl(request, token)
    const url = new URL(result)
    const params = new URLSearchParams(url.searchParams)
    expect(url.protocol).toBe('https:')
    expect(url.host).toBe('example.com')
    expect(url.pathname).toBe('/sign-out')
    expect(params.get('post_logout_redirect_uri')).toBe(mockSignOutRedirectUrl)
    expect(params.get('id_token_hint')).toBe(token)
    expect(params.get('state')).toBe('mock-state')
  })

  test('should throw an error if oidc config request fails', async () => {
    mockGetOidcConfig.mockRejectedValue(new Error('Test error'))
    await expect(getSignOutUrl(request, token)).rejects.toThrow('Test error')
  })

  test('should throw an error if state creation fails', async () => {
    mockCreateState.mockImplementation(() => { throw new Error('Test error') })
    await expect(getSignOutUrl(request, token)).rejects.toThrow('Test error')
  })
})
