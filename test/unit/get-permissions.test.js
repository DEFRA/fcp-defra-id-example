import { getPermissions } from '../../src/auth/get-permissions.js'

const crn = '1234567890'
const organisationId = '1234567'
const token = 'DEFRA-ID-JWT'

describe('getPermissions', () => {
  test('should return role as farmer', async () => {
    const { role } = await getPermissions(crn, organisationId, token)
    expect(role).toBe('Farmer')
  })

  test('should return scope as array', async () => {
    const { scope } = await getPermissions(crn, organisationId, token)
    expect(scope).toBeInstanceOf(Array)
  })

  test('should return scope with default scope', async () => {
    const { scope } = await getPermissions(crn, organisationId, token)
    expect(scope).toContain('user')
  })

  test('should return scope with full business scope', async () => {
    const { scope } = await getPermissions(crn, organisationId, token)
    expect(scope).toContain('Full permission - business')
  })
})
