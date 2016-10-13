/* global describe, it */
import { expect } from 'chai';

import each from '../../src/utils/each';

describe('Utility :: each', function () {
  it('processes items from an array, and triggers callback on success', function (done) {
    let count = 0;
    const numbers = [0, 1, 2, 3, 4, 5];

    each(numbers, (number, cb) => {
      count += number;

      cb(null);
    }, (err) => {
      if (err) {
        return done(err);
      }

      expect(err).to.equal(null);
      expect(count).to.equal(15);

      done();
    });
  });

  it('processes items from an array, and triggers callback on failure', function (done) {
    let count = 0; // eslint-disable-line
    const numbers = [0, 1, 2, 3, 4, 5];

    each(numbers, (number, cb) => {
      if (number === 3) {
        return cb(new Error(`Refusing to process number ${number}`));
      }

      count += number;

      cb(null);
    }, (err) => {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('Refusing to process number 3');

      done();
    });
  });
});
