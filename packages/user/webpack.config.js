const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3001,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: 'http://localhost:3001/',
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
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'user',
      filename: 'remoteEntry.js',
      remotes: {
        base: 'base@http://localhost:3000/remoteEntry.js',
      },
      exposes: {
        './UserList': './src/components/UserList',
        './UserProfile': './src/components/UserProfile',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: false,
          import: false, // 不打包 react，完全从 base 获取
        },
        'react-dom': {
          singleton: true,
          requiredVersion: false,
          import: false, // 不打包 react-dom，完全从 base 获取
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
