const request = require('supertest');
const server = require('../lib/server.js')

const config = {
  timeWindow: 60,
  app: {
    host: '127.0.0.1',
    port: '8000'
  }
}

describe('server', () => {
  let app
  before(async () => {
    app = await server(config)
  })

  describe('GET /ping', () => {
    it('respond with status 200', (done) => {
      request(app)
        .get('/ping')
        .expect(200, done);
    })
  })

  describe('GET /transactions', () => {
    it('respond with json', (done) => {
      request(app)
        .get('/transactions')
        .expect('Content-Type', /json/)
        .expect(200, {
          avg: 0,
          count: 0,
          max: 0,
          min: 0,
          sum: 0
        }, done);
    })
  })

  describe('POST /transactions', () => {
    it('respond with status 201', (done) => {
      request(app)
        .post('/transactions')
        .send({ amount: 100, timestamp: new Date().getTime() })
        .expect(201, done);
    })

    it('respond with status 204', (done) => {
      request(app)
        .post('/transactions')
        // timestamp 120s ago
        .send({ amount: 100, timestamp: new Date().getTime() - 120 * 1000 })
        .expect(204, done);
    })

    it('respond with status 400', (done) => {
      request(app)
        .post('/transactions')
        .send({ amount: '100', timestamp: new Date().getTime() })
        .expect(400, done);
    })
  })
})
