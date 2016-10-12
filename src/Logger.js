import async from 'async';

import {
  defaultLevels,
  defaultKeys
} from './constants';

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
    Object.keys(this.options.levels).forEach((levelMethodName) => {
      const level = this.options.levels[levelMethodName];

      const levelName = (typeof level.name !== 'undefined')
        ? level.name
        : levelMethodName;

      // regular logs
      if (level.error !== true) {
        this[levelMethodName] = function (event, message, meta, cb) {
          this.log(levelName, event, message, meta, cb);
        }.bind(this);

        return;
      }

      const errorMessageKey = (typeof this.options.errorMessageKey !== 'undefined')
        ? this.options.errorMessageKey
        : defaultKeys.errorMessage;

      const errorStackKey = (typeof this.options.errorStackKey !== 'undefined')
        ? this.options.errorStackKey
        : defaultKeys.errorStack;

      // logs with error
      this[levelMethodName] = function (event, error, message, meta, cb) {
        this.log(levelName, event, message, {
          ...meta,
          [errorMessageKey]: error.message,
          [errorStackKey]: error.stack
        }, cb);
      }.bind(this);
    });
  }

  log(level, event, message, meta = {}, logCallback = null) {
    async.each(this.transportInstances, (transport, asyncCallback) => {
      let formatted = {
        level,
        event,
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
          : defaultKeys.timestamp;

        formatted.meta[timestampKey] = timestamp;
      }

      this.options.formatters.forEach((formatter) => {
        formatted = formatter(
          formatted.level,
          formatted.event,
          formatted.message,
          formatted.meta
        );
      });

      transport.log(
        formatted.level,
        formatted.event,
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
