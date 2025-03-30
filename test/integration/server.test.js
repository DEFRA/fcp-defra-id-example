import { jest } from '@jest/globals'

jest.unstable_mockModule('@hapi/catbox-redis', async () => {
  const CatboxMemory = await import('@hapi/catbox-memory')
  return CatboxMemory
})

jest.unstable_mockModule('../../src/auth/get-oidc-config.js', async () => {
  return {
    getOidcConfig: async () => ({
      authorization_endpoint: 'https://oidc.example.com/authorize',
      token_endpoint: 'https://oidc.example.com/token',
      end_session_endpoint: 'https://oidc.example.com/logout',
      jwks_uri: 'https://oidc.example.com/jwks'
    })
  }
})

const { createServer } = await import('../../src/server')

let server

describe('server', () => {
  beforeEach(async () => {
    server = await createServer()
  })

  afterEach(async () => {
    if (server) {
      await server.stop()
    }
  })

  test('starts successfully', async () => {
    await server.initialize()
  })
})
