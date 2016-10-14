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
  const levels = (typeof options.levels !== 'undefined')
    ? options.levels
    : null;

  const name = (typeof options.name !== 'undefined')
    ? options.name
    : 'ConsoleTransport';

  const useConsole = (typeof options.console !== 'undefined')
    ? options.console
    : console; // eslint-disable-line

  return createTransport({
    name,

    log(level, event, message, meta, cb) {
      if (levels && levels.indexOf(level) === -1) {
        // skipping
        return cb(null);
      }

      useConsole.log(`[${level}]`, event, message, meta);

      cb(null);
    }
  });
}
