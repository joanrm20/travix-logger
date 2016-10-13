/* global describe, it, beforeEach */
import { expect } from 'chai';

import { Logger, constants, createTransport } from '../src';

describe('Logger', function () {
  let logs = [];
  let logs2 = [];

  const TestTransport = createTransport({
    log(level, event, message, meta, cb) {
      logs.push({
        level,
        event,
        message,
        meta
      });

      cb(null);
    }
  });

  const TestTransport2 = createTransport({
    log(level, event, message, meta, cb) {
      logs2.push({
        level,
        event,
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
        name: 'error'
      },
      warn: {
        // different method name
        name: 'warning'
      },
      info: {
        // no specified method name
      }
    }

    const logger = new Logger({
      levels: customLevels
    });

    expect(logger.error).to.be.a('function');
    expect(logger.warning).to.not.be.a('function'); // NOT a function
    expect(logger.warn).to.be.a('function');
    expect(logger.info).to.be.a('function');
  });

  it('sends log to transport', function () {
    const logger = new Logger({
      transports: [
        TestTransport
      ]
    });

    logger.log('Error', 'CustomErrorEvent', 'Error occurred');
    expect(logs[0]).to.eql({
      level: 'Error',
      event: 'CustomErrorEvent',
      message: 'Error occurred',
      meta: {}
    });

    logger.error('CustomErrorEvent', 'Another error', { key: 'value' });
    expect(logs[1]).to.eql({
      level: 'Error',
      event: 'CustomErrorEvent',
      message: 'Another error',
      meta: { key: 'value' }
    });
  });

  it('sends log to multiple transports, and triggers callback when finished with all', function (done) {
    const logger = new Logger({
      transports: [
        TestTransport,
        TestTransport2
      ]
    });

    logger.log('Error', 'SomeErrorEvent', 'Error occurred', {}, (err) => {
      expect(err).to.equal(null);

      expect(logs[0]).to.eql({
        level: 'Error',
        event: 'SomeErrorEvent',
        message: 'Error occurred',
        meta: {}
      });
      expect(logs2[0]).to.eql({
        level: 'Error',
        event: 'SomeErrorEvent',
        message: 'Error occurred',
        meta: {}
      });

      done();
    });
  });

  it('sends formatted data to transport', function () {
    const logger = new Logger({
      transports: [
        TestTransport
      ],
      formatters: [
        function myCustomFormatter(level, event, message, meta) {
          message = `[${level}] ${message}`;
          meta.newKey = 'newValue';

          return {
            level,
            event,
            message,
            meta
          };
        },
        function mySecondFormatter(level, event, message, meta) {
          meta.secondFormatter = true;

          return {
            level,
            event,
            message,
            meta
          };
        }
      ]
    });

    logger.info('SomeEvent', 'Info message', { key: 'value' });
    expect(logs[0]).to.eql({
      level: 'Info',
      event: 'SomeEvent',
      message: '[Info] Info message',
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

    logger.info('SomeEventHere', 'Info message', { key: 'value' });
    expect(logs[0]).to.eql({
      level: 'Info',
      event: 'SomeEventHere',
      message: 'Info message',
      meta: {
        defaultKey: 'defaultValue',
        key: 'value'
      }
    });

    logger.info('SomeEventHere', 'Second message');
    expect(logs[1]).to.eql({
      level: 'Info',
      event: 'SomeEventHere',
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

    logger.info('EventName', 'Info message', { key: 'value' });
    expect(logs[0]).property('level', 'Info');
    expect(logs[0]).property('event', 'EventName');
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

    logger.info('EventName', 'Info message', { key: 'value' });
    expect(logs[0]).property('level', 'Info');
    expect(logs[0]).property('event', 'EventName');
    expect(logs[0]).property('message', 'Info message');
    expect(logs[0].meta).property('key', 'value');
    expect(logs[0].meta.myTimestampKey).to.be.an.instanceof(Date);
    expect(logs[0].meta.timestamp).to.be.undefined;
  });

  it('logs exceptions with error objects', function () {
    const logger = new Logger({
      transports: [
        TestTransport
      ]
    });

    const error = new Error('Some error');
    logger.exception('SomeErrorEvent', error, 'Additional message', { key: 'value' });

    expect(logs[0]).property('level', 'Error');
    expect(logs[0]).property('event', 'SomeErrorEvent');
    expect(logs[0]).property('message', 'Additional message');
    expect(logs[0].meta).property('key', 'value');
    expect(logs[0].meta).property('exceptionmessage', 'Some error');
    expect(logs[0].meta.exceptiondetails).to.contain('Error: Some error');
  });

  it('logs exceptions with error objects in custom keys', function () {
    const logger = new Logger({
      transports: [
        TestTransport
      ],
      errorMessageKey: '_errorMessage',
      errorStackKey: '_errorStack'
    });

    const error = new Error('Some error');
    logger.exception('SomeErrorEvent', error, 'Additional message', { key: 'value' });

    expect(logs[0]).property('level', 'Error');
    expect(logs[0]).property('event', 'SomeErrorEvent');
    expect(logs[0]).property('message', 'Additional message');
    expect(logs[0].meta).property('key', 'value');
    expect(logs[0].meta).property('_errorMessage', 'Some error');
    expect(logs[0].meta._errorStack).to.contain('Error: Some error');
  });
});
