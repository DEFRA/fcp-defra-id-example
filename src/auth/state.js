import crypto from 'crypto'

function createState (request) {
  const state = Buffer.from(JSON.stringify({ id: crypto.randomUUID() })).toString('base64')
  request.yar.set('state', state)
  return state
}

function validateState (request, state) {
  const storedState = request.yar.get('state')
  request.yar.clear('state')

  if (storedState !== state) {
    throw new Error('Invalid state, possible CSRF attack')
  }
}

export { createState, validateState }
