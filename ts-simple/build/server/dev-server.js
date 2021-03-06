require('../check-versions')()

const config = require('../../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

const chalk = require('chalk')
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const proxyMiddleware = require('http-proxy-middleware')
const portfinder = require('portfinder')
const webpackConfig = require('../webpack.dev.conf')

const port = process.env.PORT || config.dev.port
const autoOpenBrowser = !!config.dev.autoOpenBrowser
const proxyTable = config.dev.proxyTable

const app = express()
const compiler = webpack(webpackConfig)


// proxy api request
app.use(require('./dev-proxy')());

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve pure static assets
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

// var uri = 'http://localhost:' + port

let _resolve
const readyPromise = new Promise(resolve => {
  _resolve = resolve
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = port
  portfinder.getPortPromise()
  .then(newPort => {
      if (port !== newPort) {
        console.log(chalk.red(`${port}端口被占用，开启新端口${newPort}`))
      }
      console.log(chalk.red(`端口：${newPort}`))
      var server = app.listen(newPort, 'localhost')
      // for 小程序的文件保存机制
      require('webpack-dev-middleware-hard-disk')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        quiet: true
      })
      resolve({
        ready: readyPromise,
        close: () => {
          server.close()
        }
      })
  }).catch(error => {
    console.log('没有找到空闲端口，请打开任务管理器杀死进程端口再试', error)
  })
})
