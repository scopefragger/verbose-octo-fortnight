/**
 * Simple dashboard cache shared across modules.
 * Any module that writes data should call invalidate() so the
 * dashboard serves fresh data on the next request.
 */
let _invalidate = null;

export function registerInvalidator(fn) {
  _invalidate = fn;
}

export function invalidateDashboardCache() {
  if (_invalidate) _invalidate();
}
