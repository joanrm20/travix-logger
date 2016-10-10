import createTransport from './createTransport';

export default createTransport({
  initialize(options) {

  },

  log(level, message, meta, cb) {
    console.log(`[${level}]`, message, meta);

    cb(null);
  }
});
