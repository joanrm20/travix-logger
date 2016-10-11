module.exports = {
  entry: __dirname + '/../',
  output: {
    path: __dirname,
    filename: 'travix-logger.js',
    libraryTarget: 'this',
    library: 'TravixLogger'
  },
  externals: {
    'async': 'async',
    'isomorphic-fetch': 'fetch',
    'lodash': '_'
  }
};
