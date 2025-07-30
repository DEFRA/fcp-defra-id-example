import Blankie from 'blankie'
import csp from '../../../src/plugins/content-security-policy.js'

describe('contentSecurityPolicy', () => {
  test('should return an object', () => {
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

  test('should restrict the script src to self and GOV.UK hash', () => {
    expect(csp.options.scriptSrc).toEqual(['self', "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='"])
  })

  test('should restrict the style src to self', () => {
    expect(csp.options.styleSrc).toEqual(['self'])
  })

  test('should restrict the frame ancestors to self', () => {
    expect(csp.options.frameAncestors).toEqual(['self'])
  })

  test('should restrict the form action to self', () => {
    expect(csp.options.formAction).toEqual(['self'])
  })

  test('should generate nonces', () => {
    expect(csp.options.generateNonces).toBe(true)
  })
})
