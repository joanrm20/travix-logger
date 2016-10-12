/**
 * Keyed by method names.
 *
 * Options:
 *   - name: Actual level name, passed to formatters and transports
 */
export default {
  debug: {
    name: 'Debug'
  },
  info: {
    name: 'Info'
  },
  warn: {
    name: 'Warning'
  },
  error: {
    name: 'Error'
  },
  exception: {
    name: 'Error',
    error: true
  }
}
