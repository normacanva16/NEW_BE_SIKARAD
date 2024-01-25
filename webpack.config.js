const path = require('path');

module.exports = {
  mode: 'production',
  entry: './app/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'final.js',
  },
  target: 'npm',
};