const path = require('path');
const webpack = require('webpack');

module.exports = (env = 'development') => {
  return {
    entry: {
      io: './index.js',
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: `[name]${env !== 'development' ? '.min' : ''}.js`,
    },
    plugins: getPlugins(env),
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: getBabelLoader(),
        },
      ],
    },
  };
};

function getPlugins (env) {
  if (env === 'development') return [];

  return [
    new webpack.optimize.UglifyJsPlugin(),
  ];
}

function getBabelLoader () {
  return {
    loader: 'babel-loader',
    options: {
      babelrc: false,
      plugins: [
        'babel-plugin-transform-async-to-generator',
      ],
      presets: [
        'babel-preset-es2015',
        // 'babel-preset-stage-3',
      ],
      cacheDirectory: true,
    },
  };
}
