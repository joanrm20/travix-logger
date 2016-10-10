export default class Transport {
  constructor(opts = {}) {
    this.options = {
      ...opts
    };
  }

  log(level, message, meta, cb) {
    cb(null);
  }
}
