module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.csv$/,
          loader: 'csv-loader',
          options: {
            dynamicTyping: true,
            header: true,
            skipEmptyLines: true
          }
        }
      ]
    }
  },
  publicPath:
    process.env.NODE_ENV === 'production'
      ? '/' + require('./package.json').name + '/'
      : '/'
};
