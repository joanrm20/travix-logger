import createTransport from '../createTransport';

/**
 * Usage:
 *
 * ```js
 * const logger = new Logger(
 *   transports: [
 *     configureConsoleTransport({
 *       console: window.console // optional
 *     })
 *   ]
 * );
 * ```
 */
export default function configureConsoleTransport(options = {}) {
  const useConsole = (typeof options.console !== 'undefined')
    ? options.console
    : console; // eslint-disable-line

  return createTransport({
    initialize() {

    },

    log(level, message, meta, cb) {
      useConsole.log(`[${level}]`, message, meta);

      cb(null);
    }
  });
}
