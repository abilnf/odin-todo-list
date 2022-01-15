var HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path');

module.exports = {
  entry: {
    main: './src/index.js'
  },
  plugins: [new HtmlWebpackPlugin({
    template: "./src/index.html"
  })],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
};
