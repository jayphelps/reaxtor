var path = require('path');
var WriteFileWebpackPlugin = require('write-file-webpack-plugin');
var devServer = {
  outputPath: path.join(__dirname, './dist'),
  contentBase: path.resolve(__dirname, './'),
  watch: true, colors: true,
  quiet: false, noInfo: false,
  hot: false, publicPath: '/dist/'
};

module.exports = {
  debug: true,
  devtool: 'source-map',
  devServer: devServer,
  entry: './src/index.js',
  output: {
    path: devServer.outputPath,
    filename: 'index.js',
    publicPath: devServer.publicPath
  },
  plugins: [
    new WriteFileWebpackPlugin({
      test: /\.(js|map|css)$/
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|dist)/,
        loader: require.resolve('babel-loader'),
        query: {
          presets: [require.resolve('babel-preset-es2015'), require.resolve('babel-preset-stage-0')],
          plugins: [
            require.resolve('babel-plugin-syntax-jsx'),
            [require.resolve('babel-reaxtor-jsx'), {
                'pragma': 'html',
                'modules': ['on', 'hook', 'hero', 'attrs', 'class', 'style', 'props', 'dataset']
            }],
            [require.resolve('babel-plugin-jsx-pragmatic'), {
              'module': 'reaxtor-jsx', 'import': 'html'
            }]
          ]
        }
      }, {
        test: /\.css$/,
        loader: 'style!css'
      },
    ],
  },
  resolve: {
    // you can now require('file') instead of require('file.js')
    extensions: ['', '.js', '.css']
  }
}
