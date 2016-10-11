import createTransport from './createTransport';

export default createTransport({
  initialize() {

  },

  log(level, message, meta, cb) {
    console.log(`[${level}]`, message, meta); // eslint-disable-line

    cb(null);
  }
});
