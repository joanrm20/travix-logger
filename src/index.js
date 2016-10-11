/* global module */
import constants from './constants';
import createTransport from './createTransport';
import Logger from './Logger';

import ConsoleTransport from './transports/ConsoleTransport';

module.exports = {
  ConsoleTransport,
  createTransport,
  Logger,
  constants
};
