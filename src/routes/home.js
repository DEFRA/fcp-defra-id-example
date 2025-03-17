const route = {
  method: 'GET',
  path: '/home',
  handler: (request, h) => {
    return h.view('home')
  }
}

export default route
