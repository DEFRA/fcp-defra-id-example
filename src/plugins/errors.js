import { constants } from 'http2'
const { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_INTERNAL_SERVER_ERROR } = constants

export default {
  plugin: {
    name: 'errors',
    register: (server, _options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          const statusCode = response.output.statusCode

          let template = '500'

          if (statusCode === HTTP_STATUS_FORBIDDEN) {
            template = '403'
          }

          if (statusCode === HTTP_STATUS_NOT_FOUND) {
            template = '404'
          }

          if (statusCode >= HTTP_STATUS_INTERNAL_SERVER_ERROR) {
            request.log(['error'], {
              statusCode,
              message: response.message,
              stack: response.data?.stack
            })
          }

          const viewResponse = h.view(template).code(statusCode)

          const originalHeaders = response.headers || response.output?.headers || {}
          for (const [key, value] of Object.entries(originalHeaders)) {
            if (key.toLowerCase() === 'content-type') {
              continue
            }
            viewResponse.header(key, value)
          }

          return viewResponse
        }
        return h.continue
      })
    }
  }
}
