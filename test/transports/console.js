/* global describe, it, beforeEach */
import { expect } from 'chai';

import { configureConsoleTransport, Transport } from '../../src';

describe('Transport :: console', function () {
  it('returns configured Transport class', function () {
    const ConsoleTransport = configureConsoleTransport();
    expect(ConsoleTransport).to.be.a('function');

    const consoleTransport = new ConsoleTransport();
    expect(consoleTransport).to.be.an.instanceof(Transport);
  });

  it('calls `console.log` on every log', function () {
    const logs = [];
    const fakeConsole = {
      log(...args) {
        logs.push({...args});
      }
    };

    const ConsoleTransport = configureConsoleTransport({
      console: fakeConsole
    });

    const consoleTransport = new ConsoleTransport();
    consoleTransport.log('Error', 'Error message', { key: 'value' }, () => {});
    expect(logs).to.eql([
      {
        '0': '[Error]',
        '1': 'Error message',
        '2': { key: 'value' }
      }
    ]);
  });

  it('calls `console.log` only for certain levels', function () {
    const logs = [];
    const fakeConsole = {
      log(...args) {
        logs.push({...args});
      }
    };
    const ConsoleTransport = configureConsoleTransport({
      console: fakeConsole,
      levels: ['Information', 'Error']
    });
    const consoleTransport = new ConsoleTransport();

    consoleTransport.log('Error', 'Error message', { key: 'value' }, () => {});
    consoleTransport.log('Warning', 'Warn message', { key: 'value' }, () => {});
    consoleTransport.log('Information', 'Info message', { key: 'value' }, () => {});

    expect(logs).to.eql([
      {
        '0': '[Error]',
        '1': 'Error message',
        '2': { key: 'value' }
      },
      {
        '0': '[Information]',
        '1': 'Info message',
        '2': { key: 'value' }
      }
    ]);
  });
});
