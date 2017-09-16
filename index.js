const startServer = require('./lib/server')

const config = {
  timeWindow: 60,
  app: {
    host: '127.0.0.1',
    port: '8000'
  }
}

try {
  startServer(config)
} catch (err) {
  console.error(err)
  process.exit(1)
}
