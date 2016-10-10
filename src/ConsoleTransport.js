import createTransport from './createTransport';

export default createTransport({
  log(level, message, meta, cb) {
    console.log(`[${level}]`, message, meta);

    cb(null);
  }
});
