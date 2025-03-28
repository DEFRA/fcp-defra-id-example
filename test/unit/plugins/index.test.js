import { jest } from '@jest/globals'
import Inert from '@hapi/inert'
import Crumb from '@hapi/crumb'
import Bell from '@hapi/bell'
import Cookie from '@hapi/cookie'
import Scooter from '@hapi/scooter'
import csp from '../../../src/plugins/content-security-policy.js'
import headers from '../../../src/plugins/headers.js'
import auth from '../../../src/plugins/auth.js'
import session from '../../../src/plugins/session.js'
import logging from '../../../src/plugins/logging.js'
import errors from '../../../src/plugins/errors.js'
import views from '../../../src/plugins/views.js'
import router from '../../../src/plugins/router.js'
import sso from '../../../src/plugins/sso.js'
import { registerPlugins } from '../../../src/plugins/index.js'

const mockRegister = jest.fn()
const mockServer = {
  register: mockRegister
}

describe('registerPlugins', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should register an array of plugins', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.any(Array))
  })

  test('should register Inert plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([Inert]))
  })

  test('should register Crumb plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([Crumb]))
  })

  test('should register Bell plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([Bell]))
  })

  test('should register Cookie plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([Cookie]))
  })

  test('should register Scooter plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([Scooter]))
  })

  test('should register csp plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([csp]))
  })

  test('should register auth plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([auth]))
  })

  test('should register session plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([session]))
  })

  test('should register logging plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([logging]))
  })

  test('should register errors plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([errors]))
  })

  test('should register headers plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([headers]))
  })

  test('should register views plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([views]))
  })

  test('should register router plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([router]))
  })

  test('should register sso plugin', async () => {
    await registerPlugins(mockServer)
    expect(mockRegister).toHaveBeenCalledWith(expect.arrayContaining([sso]))
  })

  test('should register headers plugin after errors plugin', async () => {
    await registerPlugins(mockServer)
    const plugins = mockRegister.mock.calls[0][0]
    const errorsIndex = plugins.findIndex(plugin => plugin.plugin.name === 'errors')
    const headersIndex = plugins.findIndex(plugin => plugin.plugin.name === 'headers')
    expect(headersIndex).toBeGreaterThan(errorsIndex)
  })
})
