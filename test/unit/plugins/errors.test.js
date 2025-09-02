import { jest } from '@jest/globals'
import errors from '../../../src/plugins/errors.js'

describe('errors', () => {
  test('should return an object', () => {
    expect(errors).toBeInstanceOf(Object)
  })

  test('should name the plugin', () => {
    expect(errors.plugin.name).toBe('errors')
  })

  test('should have a register function', () => {
    expect(errors.plugin.register).toBeInstanceOf(Function)
  })

  describe('errors plugin extension handler', () => {
    let mockViewResponse
    let mockH
    let mockRequest
    let mockServer
    let errorHandler

    beforeEach(() => {
      jest.clearAllMocks()

      mockViewResponse = {
        code: jest.fn().mockReturnThis(),
        header: jest.fn().mockReturnThis()
      }

      mockH = {
        view: jest.fn().mockReturnValue(mockViewResponse),
        continue: Symbol('continue')
      }

      mockRequest = {
        log: jest.fn(),
        response: {
          isBoom: true,
          output: { statusCode: 500 },
          headers: {
            'x-test': 'value',
            'content-type': 'application/json'
          },
          message: 'Test error'
        }
      }

      mockServer = {
        ext: jest.fn().mockImplementation((event, handler) => {
          if (event === 'onPreResponse') {
            errorHandler = handler
          }
        })
      }

      errors.plugin.register(mockServer, {})
    })

    test('should register onPreResponse handler', () => {
      expect(mockServer.ext).toHaveBeenCalledWith('onPreResponse', expect.any(Function))
      expect(errorHandler).toBeDefined()
    })

    test('should preserve non-content headers if error', () => {
      const result = errorHandler(mockRequest, mockH)

      expect(mockViewResponse.header).toHaveBeenCalledWith('x-test', 'value')
      expect(mockViewResponse.header).not.toHaveBeenCalledWith('content-type', 'application/json')
      expect(result).toBe(mockViewResponse)
    })
  })
})
