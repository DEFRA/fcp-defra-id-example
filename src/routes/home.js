export default {
  method: 'GET',
  path: '/home',
  options: {
    auth: { scope: ['user'] }
  },
  handler: (request, h) => {
    return h.view('home')
  }
}
