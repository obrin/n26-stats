const express = require('express')
const bodyParser = require('body-parser')

const config = {
  app: {
    host: '0.0.0.0',
    port: '8000'
  }
}

async function start () {
  const app = express()

  /**
   * Middleware
   */
  // parse JSON
  app.use(bodyParser.json())

  /**
   * Routes
   */
  app.get('/ping', (req, res) => {
    res.send('pong')
  })

  app.get('/transactions', (req, res) => {
    res.json(200)
  })

  app.post('/transactions', (req, res) => {
    res.sendStatus(201)
  })

  /**
   * Server
   */
  app.listen(config.app.port, config.app.host, (error) => {
    if (error) {
      console.error(error)
      process.exit(1)
    }

    console.log(`Server listening on ${config.app.host}:${config.app.port}`)
  })
}

try {
  start()
} catch (err) {
  console.error(err)
  process.exit(1)
}
