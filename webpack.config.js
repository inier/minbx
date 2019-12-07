const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

function resolve(...filePath) {
  return path.join(__dirname, ...filePath);
}

module.exports = {
  entry: './index.ts',
  output: {
    filename: '[name].js',
    path: resolve('./dist'),
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'awesome-typescript-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('./index.html'),
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      mobx: path.join(__dirname, 'node_modules/mobx/lib/mobx.es6.js'),
    },
  },
  devServer: {
    contentBase: resolve('./dist'),
    disableHostCheck: true,
    inline: true,
    open: true,
    hot: true,
  },
};
