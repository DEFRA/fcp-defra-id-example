function getSafeRedirect (redirect) {
  if (!redirect?.startsWith('/') || redirect.startsWith('//')) {
    return '/home'
  }
  return redirect
}

export { getSafeRedirect }
