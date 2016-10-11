/* global fetch */
import 'isomorphic-fetch';

import createTransport from '../createTransport';

/**
 * Usage:
 *
 * ```js
 * const logger = new Logger(
 *   transports: [
 *     configureHttpTransport({
 *       url: 'https://mylogs.example.com/some/path'
 *       method: 'POST',
 *       headers: {
 *         'Accept': 'application/json',
 *         'Content-Type': 'application/json'
 *       },
 *       credentials: 'same-origin',
 *       mode: 'cors',
 *       cache: 'default',
 *       redirect: 'follow',
 *       formatBody(level, message, meta) {
 *         return JSON.stringify({
 *           level,
 *           message,
 *           ...meta
 *         });
 *       }
 *     })
 *   ]
 * );
 * ```
 */

function makeFetchOptions(options) {
  const fetchOptions = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // fetch API options
  [
    'method',
    'headers',
    'credentials',
    'mode',
    'cache',
    'redirect',
    'referrer',
    'referrerPolicy',
    'integrity'
  ].forEach((optionKey) => {
    if (typeof options[optionKey] !== 'undefined') {
      fetchOptions[optionKey] = options[optionKey];
    }
  });

  return fetchOptions;
}

export default function configureHttpTransport(options = {}) {
  if (typeof options.url === 'undefined') {
    throw new Error('Must provide `url`.');
  }

  const fetchOptions = makeFetchOptions(options);

  if (['GET', 'HEAD'].indexOf(fetchOptions.method.toUpperCase()) > -1) {
    throw new Error('Method does not accept `body`.');
  }

  const formatBody = (typeof options.formatBody !== 'undefined')
    ? options.formatBody
    : (level, message, meta) => JSON.stringify({ level, message, ...meta });

  return createTransport({
    log(level, message, meta, cb) {
      fetch(options.url, {
        ...fetchOptions,
        body: formatBody(level, message, meta)
      })
        .then((response) => cb(null, response))
        .catch(cb);
    }
  });
}
