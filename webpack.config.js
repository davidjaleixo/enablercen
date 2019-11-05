const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// assets.js
const Assets = require('./config/assets');


module.exports = {
    devtool: 'eval',
    entry: {
        app: "./frontend/public/js/app.js",
        style: "./frontend/public/css/style.scss"
        
        
    },
    output: {
        path: __dirname + "/frontend/public/libs",
        filename: "[name].bundle.js"
    },
    plugins: [
      new CopyWebpackPlugin(
        Assets.map(asset => {
          return {
            from: path.resolve(__dirname, `./node_modules/${asset}`),
            to: path.resolve(__dirname, './frontend/public/libs')
          };
        })
      )
    ],
    module: {
        loaders: [
            {
              test: /\.scss$/,
              loader: 'style-loader!css-loader!resolve-url-loader'
            },
            {
              test: /\.(woff(2)?|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
              use: [{
                  loader: 'file-loader',
                  options: {
                      name: '[name].[ext]',
                      outputPath: './fonts'
                  }
              }]
            }
        ]
        /*loaders: [
          {
            test: /\.css$/,
            loader: 'style-loader!css-loader?sourceMap'
          }, {
            test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
            loader: "url-loader?limit=10000&mimetype=application/font-woff"
          }, {
            test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
            loader: "url-loader?limit=10000&mimetype=application/font-woff"
          }, {
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
            loader: "url-loader?limit=10000&mimetype=application/octet-stream"
          }, {
            test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
            loader: "file-loader"
          }, {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            loader: "url-loader?limit=10000&mimetype=image/svg+xml"
          }
        ]*/
    }
};