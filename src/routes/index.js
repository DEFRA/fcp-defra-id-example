export default {
  method: 'GET',
  path: '/',
  options: {
    auth: { mode: 'try' }
  },
  handler: (request, h) => {
    return h.view('index')
  }
}
