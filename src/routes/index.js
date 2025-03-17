const route = {
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return h.view('index')
  }
}

export default route
