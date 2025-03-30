import { getSafeRedirect } from '../../../src/utils/get-safe-redirect'

describe('getSafeRedirect', () => {
  test('should return provided redirect if it is a local route starting with "/"', () => {
    const redirect = '/location'
    const result = getSafeRedirect(redirect)
    expect(result).toBe(redirect)
  })

  test('should return "/home" if redirect is not a local route', () => {
    const redirect = 'https://an.unsafe-location.com'
    const result = getSafeRedirect(redirect)
    expect(result).toBe('/home')
  })

  test('should return "/home" if redirect is a domain name only', () => {
    const redirect = 'an.unsafe-location.com'
    const result = getSafeRedirect(redirect)
    expect(result).toBe('/home')
  })

  test('should return "/home" if redirect is undefined', () => {
    const result = getSafeRedirect(undefined)
    expect(result).toBe('/home')
  })

  test('should return "/home" if redirect is null', () => {
    const result = getSafeRedirect(null)
    expect(result).toBe('/home')
  })
})
