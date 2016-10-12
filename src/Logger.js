import async from 'async';

import { defaultLevels, defaultTimestampKey } from './constants';

export default class Logger {
  constructor(opts = {}) {
    this.options = {
      levels: defaultLevels,

      // array of Transport classes
      transports: [],

      // array of formatter functions
      formatters: [],

      // default meta object, which log meta will extend from
      defaultMeta: {},

      timestamp: false,

      ...opts
    };

    this.transportInstances = this.options.transports.map((Transport) => {
      return new Transport({
        logger: this
      });
    });

    // generated level methods
    Object.keys(this.options.levels).forEach((levelName) => {
      const level = this.options.levels[levelName];

      const levelMethodName = (typeof level.methodName !== 'undefined')
        ? level.methodName
        : levelName;

      this[levelMethodName] = function (message, meta) {
        this.log(levelName, message, meta);
      }.bind(this);
    });
  }

  log(level, message, meta = {}, logCallback = null) {
    async.each(this.transportInstances, (transport, asyncCallback) => {
      let formatted = {
        level,
        message,
        meta: {
          ...this.options.defaultMeta,
          ...meta
        }
      };

      if (this.options.timestamp) {
        const timestamp = new Date();
        const timestampKey = (typeof this.options.timestamp === 'string')
          ? this.options.timestamp
          : defaultTimestampKey;

        formatted.meta[timestampKey] = timestamp;
      }

      this.options.formatters.forEach((formatter) => {
        formatted = formatter(
          formatted.level,
          formatted.message,
          formatted.meta
        );
      });

      transport.log(
        formatted.level,
        formatted.message,
        formatted.meta,
        asyncCallback
      );
    }, (err) => {
      if (typeof logCallback === 'function') {
        logCallback(err);
      }
    });
  }
}
