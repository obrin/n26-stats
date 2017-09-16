const express = require('express')
const bodyParser = require('body-parser')
const TransactionStatus = require('./transactionStatus')

const config = {
  timeWindow: 60,
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
   * Helpers
   */
  const transaction = new TransactionStatus({ timeWindow: config.timeWindow })

  // initialize removal of oldest transaction every second
  const statusRemovalInterval = setInterval(() => {
    transaction.remove()
  }, 1000)

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
    const { amount, timestamp } = req.body

    if (typeof amount !== 'number' || typeof timestamp !== 'number') {
      return res.sendStatus(400)
    }

    let isRecorded
    try {
      isRecorded = transaction.add(amount, timestamp, new Date().getTime())
    } catch (err) {
      console.error(err)
      return res.sendStatus(500)
    }

    if (isRecorded) {
      return res.sendStatus(201)
    }

    return res.sendStatus(204)
  })

  /**
   * Server
   */
  app.listen(config.app.port, config.app.host, (error) => {
    if (error) {
      clearInterval(statusRemovalInterval)
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
