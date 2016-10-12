/* global fetch */
import 'isomorphic-fetch';

import { defaultKeys } from '../constants';
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
 *       formatBody(level, event, message, meta) {
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

  const levels = (typeof options.levels !== 'undefined')
    ? options.levels
    : null;

  const eventKey = (typeof options.eventKey !== 'undefined')
    ? options.eventKey
    : defaultKeys.event;

  const formatBody = (typeof options.formatBody !== 'undefined')
    ? options.formatBody
    : (level, event, message, meta) => {
      return JSON.stringify({
        level,
        [eventKey]: event,
        message,
        ...meta
      });
    };

  return createTransport({
    log(level, event, message, meta, cb) {
      if (levels && levels.indexOf(level) === -1) {
        // skipping
        return cb(null);
      }

      fetch(options.url, {
        ...fetchOptions,
        body: formatBody(level, event, message, meta)
      })
        .then((response) => cb(null, response))
        .catch(cb);
    }
  });
}
