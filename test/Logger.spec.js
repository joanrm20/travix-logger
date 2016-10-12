/* global describe, it, beforeEach */
import { expect } from 'chai';

import { Logger, constants, createTransport } from '../src';

describe('Logger', function () {
  let logs = [];
  let logs2 = [];

  const TestTransport = createTransport({
    log(level, message, meta, cb) {
      logs.push({
        level,
        message,
        meta
      });

      cb(null);
    }
  });

  const TestTransport2 = createTransport({
    log(level, message, meta, cb) {
      logs2.push({
        level,
        message,
        meta
      });

      cb(null);
    }
  });

  beforeEach(function () {
    logs = [];
    logs2 = [];
  });

  it('creates instance with default levels', function () {
    const logger = new Logger();

    expect(logger.options.levels).to.eql(constants.defaultLevels);
  });

  it('creates instance with custom level methods', function () {
    const customLevels = {
      error: {
        // same method name
        methodName: 'error'
      },
      warn: {
        // different method name
        methodName: 'warning'
      },
      info: {
        // no specified method name
      }
    }

    const logger = new Logger({
      levels: customLevels
    });

    expect(logger.error).to.be.a('function');
    expect(logger.warning).to.be.a('function');
    expect(logger.warn).to.not.be.a('function'); // NOT a function
    expect(logger.info).to.be.a('function');
  });

  it('sends log to transport', function () {
    const logger = new Logger({
      transports: [
        TestTransport
      ]
    });

    logger.log('error', 'Error occurred');
    expect(logs[0]).to.eql({
      level: 'error',
      message: 'Error occurred',
      meta: {}
    });

    logger.error('Another error', { key: 'value' });
    expect(logs[1]).to.eql({
      level: 'error',
      message: 'Another error',
      meta: { key: 'value' }
    });
  });

  it('sends log to multiple transports', function () {
    const logger = new Logger({
      transports: [
        TestTransport,
        TestTransport2
      ]
    });

    logger.log('error', 'Error occurred');

    expect(logs[0]).to.eql({
      level: 'error',
      message: 'Error occurred',
      meta: {}
    });
    expect(logs2[0]).to.eql({
      level: 'error',
      message: 'Error occurred',
      meta: {}
    });
  });

  it('sends formatted data to transport', function () {
    const logger = new Logger({
      transports: [
        TestTransport
      ],
      formatters: [
        function myCustomFormatter(level, message, meta) {
          message = `[${level}] ${message}`;
          meta.newKey = 'newValue';

          return {
            level,
            message,
            meta
          };
        },
        function mySecondFormatter(level, message, meta) {
          meta.secondFormatter = true;

          return {
            level,
            message,
            meta
          };
        }
      ]
    });

    logger.info('Info message', { key: 'value' });
    expect(logs[0]).to.eql({
      level: 'info',
      message: '[info] Info message',
      meta: {
        key: 'value',
        newKey: 'newValue',
        secondFormatter: true
      }
    });
  });

  it('logs meta extending default meta', function () {
    const logger = new Logger({
      transports: [
        TestTransport
      ],
      defaultMeta: {
        defaultKey: 'defaultValue'
      }
    });

    logger.info('Info message', { key: 'value' });
    expect(logs[0]).to.eql({
      level: 'info',
      message: 'Info message',
      meta: {
        defaultKey: 'defaultValue',
        key: 'value'
      }
    });

    logger.info('Second message');
    expect(logs[1]).to.eql({
      level: 'info',
      message: 'Second message',
      meta: {
        defaultKey: 'defaultValue'
      }
    });
  });

  it('logs with timestamp, when enabled', function () {
    const logger = new Logger({
      transports: [
        TestTransport
      ],
      timestamp: true
    });

    logger.info('Info message', { key: 'value' });
    expect(logs[0]).property('level', 'info');
    expect(logs[0]).property('message', 'Info message');
    expect(logs[0].meta).property('key', 'value');
    expect(logs[0].meta.timestamp).to.be.an.instanceof(Date);
  });

  it('logs with timestamp, in a different meta key', function () {
    const logger = new Logger({
      transports: [
        TestTransport
      ],
      timestamp: 'myTimestampKey'
    });

    logger.info('Info message', { key: 'value' });
    expect(logs[0]).property('level', 'info');
    expect(logs[0]).property('message', 'Info message');
    expect(logs[0].meta).property('key', 'value');
    expect(logs[0].meta.myTimestampKey).to.be.an.instanceof(Date);
    expect(logs[0].meta.timestamp).to.be.undefined;
  });
});
