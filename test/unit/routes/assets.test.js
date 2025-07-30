import route from '../../../src/routes/assets.js'

describe('assets', () => {
  test('should return an object', () => {
    expect(route).toBeInstanceOf(Object)
  })

  test('should return GET /assets route', () => {
    expect(route.method).toBe('GET')
    expect(route.path).toBe('/assets/{path*}')
  })

  test('should not require authentication', () => {
    expect(route.options.auth).toBe(false)
  })

  test('should return an array of asset paths', () => {
    expect(route.options.handler.directory.path).toBeInstanceOf(Array)
  })

  test('should return any govuk frontend asset', () => {
    expect(route.options.handler.directory.path).toContain('node_modules/govuk-frontend/dist/govuk/assets')
  })

  test('should return any govuk rebrand frontend asset', () => {
    expect(route.options.handler.directory.path).toContain('node_modules/govuk-frontend/dist/govuk/assets/rebrand')
  })

  test('should return any local asset', () => {
    expect(route.options.handler.directory.path).toContain('src/assets')
  })
})
