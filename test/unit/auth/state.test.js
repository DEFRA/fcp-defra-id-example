import crypto from 'crypto'
import { jest } from '@jest/globals'

const cryptoSpy = jest.spyOn(crypto, 'randomUUID')

const mockSet = jest.fn()
const mockGet = jest.fn()
const mockClear = jest.fn()

const mockRequest = { yar: { set: mockSet, get: mockGet, clear: mockClear } }
let mockState

const { createState, validateState } = await import('../../../src/auth/state.js')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('createState', () => {
  test('should generate a unique id for the state', () => {
    createState(mockRequest)
    expect(cryptoSpy).toHaveBeenCalled()
  })

  test('should store the state in the session in the state key', () => {
    createState(mockRequest)
    expect(mockSet.mock.calls[0][0]).toBe('state')
  })

  test('should store state as a base64 encoded string', () => {
    createState(mockRequest)
    expect(mockSet.mock.calls[0][1]).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)
  })

  test('should store the unique id in the state', () => {
    createState(mockRequest)
    const state = Buffer.from(mockSet.mock.calls[0][1], 'base64').toString()
    expect(JSON.parse(state).id).toBe(cryptoSpy.mock.results[0].value)
  })

  test('should return the state', () => {
    const state = createState(mockRequest)
    expect(state).toBe(mockSet.mock.calls[0][1])
  })
})

describe('validateState', () => {
  beforeEach(() => {
    mockState = Buffer.from(JSON.stringify({ id: crypto.randomUUID() })).toString('base64')
    mockGet.mockReturnValue(mockState)
  })

  test('should get the state from the session', () => {
    validateState(mockRequest, mockState)
    expect(mockGet).toHaveBeenCalledWith('state')
  })

  test('should clear the state from the session', () => {
    validateState(mockRequest, mockState)
    expect(mockClear).toHaveBeenCalledWith('state')
  })

  test('should not throw an error if stored state matches returned state', () => {
    expect(() => validateState(mockRequest, mockState)).not.toThrow()
  })

  test('should throw an error if stored state does not match returned state', () => {
    expect(() => validateState(mockRequest, 'invalid-state')).toThrow('Invalid state, possible CSRF attack')
  })

  test('should throw an error if no stored state is found', () => {
    mockGet.mockReturnValue(undefined)
    expect(() => validateState(mockRequest, mockState)).toThrow('Invalid state, possible CSRF attack')
  })
})
