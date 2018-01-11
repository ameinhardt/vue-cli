module.exports = (api, options) => {
  api.chainWebpack(config => {
    config.entry('app')
      .clear()
      .add('./src/main.ts')

    config.resolve
      .extensions
        .merge(['.ts', '.tsx'])

    const tsRule = config.module
      .rule('ts')
        .test(/\.tsx?$/)
        .include
          .add(api.resolve('src'))
          .add(api.resolve('test'))
          .end()

    if (options.experimentalCompileTsWithBabel) {
      // Experimental: compile TS with babel so that it can leverage
      // preset-env for auto-detected polyfills based on browserslists config.
      // this is pending on the readiness of @babel/preset-typescript.
      tsRule
        .use('babel-loader')
          .loader('babel-loader')

      config.module
        .rule('vue')
          .use('vue-loader')
            .tap(options => {
              options.loaders.ts = 'babel-loader'
              return options
            })
    } else {
      tsRule
        .use('ts-loader')
          .loader('ts-loader')
          .options({
            transpileOnly: true,
            appendTsSuffixTo: [/\.vue$/]
          })
    }

    config
      .plugin('fork-ts-checker')
        .use(require('fork-ts-checker-webpack-plugin'), [{
          vue: true,
          tslint: options.lintOnSave,
          formatter: 'codeframe'
        }])
  })

  api.registerCommand('lint', {
    descriptions: 'lint source files with TSLint',
    usage: 'vue-cli-service lint [options] [...files]',
    options: {
      '--format': 'specify formatter (default: codeframe)',
      '--no-fix': 'do not fix errors'
    },
    details: 'For more options, see https://palantir.github.io/tslint/usage/cli/'
  }, args => {
    return require('./lib/tslint')(args, api)
  })
}
