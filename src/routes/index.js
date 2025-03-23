const route = {
  method: 'GET',
  path: '/',
  options: {
    auth: { mode: 'try' }
  },
  handler: (request, h) => {
    return h.view('index')
  }
}

export default route
