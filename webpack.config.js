const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });
dotenv.config({ path: path.join(__dirname, 'backend', '.env'), override: true });

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash:8].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      title: 'EduGenAI — AI-Powered Educational Image Generation Platform',
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_BASE_URL': JSON.stringify(
        process.env.REACT_APP_API_BASE_URL && !process.env.REACT_APP_API_BASE_URL.includes('localhost:5000')
          ? process.env.REACT_APP_API_BASE_URL
          : '/api'
      ),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
    historyApiFallback: true,
    hot: false,
    liveReload: false,
    webSocketServer: false,
    client: false,
    open: false,
    setupMiddlewares: (middlewares, devServer) => {
      const express = require('express');
      devServer.app.set('trust proxy', 1);
      devServer.app.use(express.json({ limit: '50mb' }));
      devServer.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
      try {
        const generationRoutes = require('./backend/routes/generationRoutes');
        const { errorHandler } = require('./backend/middleware/errorHandler');
        devServer.app.use('/api', generationRoutes);
        devServer.app.use('/api', errorHandler);
      } catch (err) {
        console.warn('Failed to attach generation routes in devServer:', err.message);
      }
      return middlewares;
    },
  },
};
