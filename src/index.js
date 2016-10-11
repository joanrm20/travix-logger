/* global module */
import constants from './constants';
import createTransport from './createTransport';
import Transport from './Transport';
import Logger from './Logger';

import configureConsoleTransport from './transports/console';

module.exports = {
  constants,
  createTransport,
  Transport,
  Logger,

  // configureable transports
  configureConsoleTransport
};
