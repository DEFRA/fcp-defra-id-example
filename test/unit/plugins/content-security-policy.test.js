import Blankie from 'blankie'
import csp from '../../../src/plugins/content-security-policy.js'

describe('contentSecurityPolicy', () => {
  test('should return an object with the correct properties', () => {
    expect(csp).toBeInstanceOf(Object)
  })

  test('should register the Blankie plugin', () => {
    expect(csp.plugin).toBe(Blankie)
  })

  test('should restrict the font src to self', () => {
    expect(csp.options.fontSrc).toEqual(['self'])
  })

  test('should restrict the img src to self', () => {
    expect(csp.options.imgSrc).toEqual(['self'])
  })

  test('should restrict the script src to self and unsafe-inline', () => {
    expect(csp.options.scriptSrc).toEqual(['self', 'unsafe-inline'])
  })

  test('should restrict the style src to self and unsafe-inline', () => {
    expect(csp.options.styleSrc).toEqual(['self', 'unsafe-inline'])
  })

  test('should restrict the frame ancestors to self', () => {
    expect(csp.options.frameAncestors).toEqual(['self'])
  })

  test('should restrict the form action to self', () => {
    expect(csp.options.formAction).toEqual(['self'])
  })

  test('should not generate nonces', () => {
    expect(csp.options.generateNonces).toBe(false)
  })
})
