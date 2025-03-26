import { generateKeyPairSync } from 'crypto'
import { jest } from '@jest/globals'
import Jwt from '@hapi/jwt'

const mockOidcConfig = { jwks_uri: 'https://example.com/jwks_uri' }
const mockGetOidcConfig = jest.fn()
jest.unstable_mockModule('../../../src/auth/get-oidc-config.js', () => ({
  getOidcConfig: mockGetOidcConfig
}))

const mockWreckGet = jest.fn()
jest.unstable_mockModule('@hapi/wreck', () => ({
  default: {
    get: mockWreckGet
  }
}))

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
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

const mockPayload = { keys: [publicKey] }

const mockToken = Jwt.token.generate({ name: 'A Farmer' }, { key: privateKey, algorithm: 'RS256' })

const { verifyToken } = await import('../../../src/auth/verify-token.js')

describe('createState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetOidcConfig.mockResolvedValue(mockOidcConfig)
    mockWreckGet.mockResolvedValue({ payload: mockPayload })
  })

  test('should get oidc config', async () => {
    await verifyToken(mockToken)
    expect(mockGetOidcConfig).toHaveBeenCalledTimes(1)
  })

  test('should make api get request to jwks uri and parse response to json', async () => {
    await verifyToken(mockToken)
    expect(mockWreckGet).toHaveBeenCalledWith(mockOidcConfig.jwks_uri, { json: true })
  })

  test('should not throw error if the token was signed by the correct key', async () => {
    await expect(verifyToken(mockToken)).resolves.not.toThrow()
  })

  test('should throw error if the token was not signed by the correct key', async () => {
    const { privateKey: wrongPrivateKey } = generateKeyPairSync('rsa', {
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

    const wrongToken = Jwt.token.generate({ name: 'A Farmer' }, { key: wrongPrivateKey, algorithm: 'RS256' })

    await expect(verifyToken(wrongToken)).rejects.toThrow('Invalid token signature')
  })
})
