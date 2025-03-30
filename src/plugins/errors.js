export default {
  plugin: {
    name: 'errors',
    register: (server, _options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          const statusCode = response.output.statusCode

          if (statusCode === 404) {
            return h.view('404').code(statusCode)
          }

          // Catch any user in incorrect scope errors
          if (statusCode === 403) {
            return h.view('403').code(statusCode)
          }

          request.log('error', {
            statusCode,
            message: response.message,
            stack: response.data?.stack
          })

          return h.view('500').code(statusCode)
        }
        return h.continue
      })
    }
  }
}
