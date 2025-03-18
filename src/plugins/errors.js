const plugin = {
  plugin: {
    name: 'errors',
    register: (server, options) => {
      server.ext('onPreResponse', (request, h) => {
        const response = request.response

        if (response.isBoom) {
          const statusCode = response.output.statusCode

          if (statusCode === 404) {
            return h.view('404').code(statusCode)
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

export default plugin
