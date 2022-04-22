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
    process.env.NODE_ENV === 'production' && process.env.REPO_NAME
      ? '/' + process.env.REPO_NAME + '/'
      : '/'
};
