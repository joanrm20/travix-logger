import Transport from './Transport';

export default function createTransport(opts = {}) {
  if (typeof opts.log === 'undefined') {
    throw new Error('Must provide a `log` method.');
  }

  class GeneratedTransport extends Transport {
    constructor(options) {
      super(options);

      if (typeof opts.initialize !== 'undefined') {
        opts.initialize.bind(this)();
      }

      this.log = opts.log.bind(this);
    }
  }

  return GeneratedTransport;
}
