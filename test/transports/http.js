/* global describe, it */
import { expect } from 'chai';
import nock from 'nock';

import { configureHttpTransport, Transport } from '../../src';

describe('Transport :: http', function () {
  it('returns configured Transport class', function () {
    const HttpTransport = configureHttpTransport({
      url: 'http://example.com/'
    });
    expect(HttpTransport).to.be.a('function');

    const httpTransport = new HttpTransport();
    expect(httpTransport).to.be.an.instanceof(Transport);
  });

  it('throws error if no `url` is given', function () {
    expect(() => {
      const HttpTransport = configureHttpTransport({});
    }).to.throw(/Must provide `url`/);
  });

  it('throws error if a method is provided, that does not accept body', function () {
    expect(() => {
      const HttpTransport = configureHttpTransport({
        url: 'http://example.com',
        method: 'GET'
      });
    }).to.throw(/Method does not accept `body`/);
  });

  it('sends data over HTTP on every log', function (done) {
    const HttpTransport = configureHttpTransport({
      url: 'http://logs.example.com/submit',
      method: 'POST'
    });
    const httpTransport = new HttpTransport({ logger: true });

    nock('http://logs.example.com')
      .post('/submit', {
        level: 'info',
        message: 'Info message',
        key: 'value'
      })
      .reply(201, function (uri, requestBody) {
        return {
          ok: true,
          requestBody
        };
      });

    httpTransport.log(
      'info',
      'Info message',
      { key: 'value' },
      function (err, response) {
        if (err) {
          return done(err);
        }

        response.json().then((body) => {
          expect(body).to.eql({
            ok: true,
            requestBody: {
              level: 'info',
              message: 'Info message',
              key: 'value'
            }
          });

          done();
        });
      }
    );
  });

  it('sends data over HTTP, with formatted body', function (done) {
    const HttpTransport = configureHttpTransport({
      url: 'http://logs.example.com/submit',
      method: 'POST',
      formatBody(level, message, meta) {
        return JSON.stringify({
          Level: level,
          Message: message,
          Meta: meta,
          someNewKey: 'someNewValue'
        });
      }
    });
    const httpTransport = new HttpTransport({ logger: true });

    nock('http://logs.example.com')
      .post('/submit', {
        Level: 'info',
        Message: 'Info message',
        Meta: {
          key: 'value'
        },
        someNewKey: 'someNewValue'
      })
      .reply(201, function (uri, requestBody) {
        return {
          ok: true,
          requestBody
        };
      });

    httpTransport.log(
      'info',
      'Info message',
      { key: 'value' },
      function (err, response) {
        if (err) {
          return done(err);
        }

        response.json().then((body) => {
          expect(body).to.eql({
            ok: true,
            requestBody: {
              Level: 'info',
              Message: 'Info message',
              Meta: {
                key: 'value'
              },
              someNewKey: 'someNewValue'
            }
          });

          done();
        });
      }
    );
  });
});
