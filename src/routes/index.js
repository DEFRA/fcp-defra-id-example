const route = {
  method: 'GET',
  path: '/',
  options: {
    auth: false
  },
  handler: (request, h) => {
    return h.view('index')
  }
}

export default route
