import { jest } from '@jest/globals'

const mockRandomUUID = jest.fn()
const mockUUID = 'mock-uuid'
jest.unstable_mockModule('crypto', () => ({
  default: {
    randomUUID: mockRandomUUID
  }
}))

const mockYarSet = jest.fn()
const mockYarGet = jest.fn()
const mockYarClear = jest.fn()

const mockRequest = { yar: { set: mockYarSet, get: mockYarGet, clear: mockYarClear } }
let mockState

const { createState, validateState } = await import('../../../src/auth/state.js')

beforeEach(() => {
  jest.clearAllMocks()
  mockRandomUUID.mockReturnValue(mockUUID)
})

describe('createState', () => {
  test('should generate a unique id for the state', () => {
    createState(mockRequest)
    expect(mockRandomUUID).toHaveBeenCalled()
  })

  test('should store the state in the session in the state key', () => {
    createState(mockRequest)
    expect(mockYarSet.mock.calls[0][0]).toBe('state')
  })

  test('should store state as a base64 encoded string', () => {
    createState(mockRequest)
    expect(mockYarSet.mock.calls[0][1]).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)
  })

  test('should store the unique id in the state', () => {
    createState(mockRequest)
    const state = Buffer.from(mockYarSet.mock.calls[0][1], 'base64').toString()
    expect(JSON.parse(state).id).toBe(mockUUID)
  })

  test('should return the state', () => {
    const state = createState(mockRequest)
    expect(state).toBe(mockYarSet.mock.calls[0][1])
  })
})

describe('validateState', () => {
  beforeEach(() => {
    mockState = Buffer.from(JSON.stringify({ id: mockUUID })).toString('base64')
    mockYarGet.mockReturnValue(mockState)
  })

  test('should get the state from the session', () => {
    validateState(mockRequest, mockState)
    expect(mockYarGet).toHaveBeenCalledWith('state')
  })

  test('should clear the state from the session', () => {
    validateState(mockRequest, mockState)
    expect(mockYarClear).toHaveBeenCalledWith('state')
  })

  test('should not throw an error if stored state matches returned state', () => {
    expect(() => validateState(mockRequest, mockState)).not.toThrow()
  })

  test('should throw an error if stored state does not match returned state', () => {
    expect(() => validateState(mockRequest, 'invalid-state')).toThrow('Invalid state, possible CSRF attack')
  })

  test('should throw an error if no stored state is found', () => {
    mockYarGet.mockReturnValue(undefined)
    expect(() => validateState(mockRequest, mockState)).toThrow('Invalid state, possible CSRF attack')
  })
})
