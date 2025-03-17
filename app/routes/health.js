const routes = [{
  method: 'GET',
  path: '/healthy',
  handler: (_request, h) => {
    return h.response('ok')
  }
}, {
  method: 'GET',
  path: '/healthz',
  handler: (_request, h) => {
    return h.response('ok')
  }
}]

export default routes
