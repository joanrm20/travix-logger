import _ from 'lodash';
import async from 'async';

import { defaultLevels } from './constants';

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

      ...opts
    };

    this.transportInstances = this.options.transports.map((Transport) => {
      return new Transport({
        logger: this
      });
    });

    // generated level methods
    _.each(this.options.levels, (level, levelName) => {
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
        meta: _.defaults(meta, this.options.defaultMeta)
      };

      this.options.formatters.forEach((formatter) => {
        formatted = formatter(formatted);
      });

      transport(formatted.level, formatted.message, formatted.meta, asyncCallback);
    }, (err) => {
      if (typeof logCallback === 'function') {
        logCallback(err);
      }
    });
  }
}
