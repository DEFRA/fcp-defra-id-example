const mockPayload = { authorization_endpoint: 'https://example.com/auth' }
const mockWellKnownUrl = 'https://example.com/.well-known/openid-configuration'

const mockWreckGet = vi.fn()
vi.mock('@hapi/wreck', () => ({
  default: {
    get: mockWreckGet
  }
}))

const mockConfigGet = vi.fn()
vi.mock('../../../src/config/index.js', () => ({
  default: {
    get: mockConfigGet
  }
}))

const { getOidcConfig } = await import('../../../src/auth/get-oidc-config.js')

describe('getOidcConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfigGet.mockReturnValue(mockWellKnownUrl)
    mockWreckGet.mockResolvedValue({ payload: mockPayload })
  })

  test('should get well known url from config', async () => {
    await getOidcConfig()
    expect(mockConfigGet).toHaveBeenCalledWith('defraId.wellKnownUrl')
  })

  test('should make api get request to well known url and parse response to json', async () => {
    await getOidcConfig()
    expect(mockWreckGet).toHaveBeenCalledWith(mockWellKnownUrl, { json: true })
  })

  test('should return the payload from the API response', async () => {
    const result = await getOidcConfig()
    expect(result).toEqual(mockPayload)
  })

  test('should throw an error if the API request fails', async () => {
    mockWreckGet.mockRejectedValue(new Error('Test error'))
    await expect(getOidcConfig()).rejects.toThrow('Test error')
  })
})
