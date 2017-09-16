const TransactionStatus = require('../transactionStatus')
const expect = require('expect')

describe('transactionInfo', () => {
  const payloads = [
    { amount: 10, timestamp: 0 },
    { amount: 11, timestamp: 1000 },
    { amount: 9, timestamp: 2000 },
    { amount: 1, timestamp: 0 }
  ]
  const sum = payloads.reduce((sum, payload) => sum + payload.amount, 0)

  describe('#add', () => {
    context('when transaction is made within time window', () => {
      const transaction = new TransactionStatus({ timeWindow: 60 })

      let subject
      before(() => {
        payloads.forEach((payload) => {
          transaction.add(payload.amount, payload.timestamp, 60000)
        })

        subject = transaction.getStatus()
      })

      it('records count including additional transaction', () => {
        expect(subject.count).toEqual(payloads.length)
      })

      it('records sum including additional transaction', () => {
        expect(subject.sum).toEqual(sum)
      })

      it('records avg including additional transaction', () => {
        expect(subject.avg).toEqual((sum) / payloads.length)
      })

      it('records max amount including additional transaction', () => {

        expect(subject.max).toEqual(payloads[1].amount)
      })

      it('records min amount including additional transaction', () => {
        expect(subject.min).toEqual(payloads[3].amount)
      })

      it('returns true', () => {
        expect(transaction.add(10, 1000, 60000)).toEqual(true)
      })
    })

    context('when transaction is made exceeding time window', () => {
      const transaction = new TransactionStatus({ timeWindow: 60 })

      it('does not record transaction status', () => {
        transaction.add(10, 0, 65000)
        transaction.add(10, 1000, 65000)
        expect(transaction.getStatus().count).toEqual(0)
      })

      it('returns false', () => {
        expect(transaction.add(10, 1000, 65000)).toEqual(false)
      })
    })

    it('does not allow transactions timestamps beyond current time', () => {
      const transaction = new TransactionStatus({ timeWindow: 60 })

      expect(transaction.add(10, 1, 0)).toEqual(false)
    })
  })

  describe('#getStatus', () => {
    context('when no initial transactions', () => {
      const transaction = new TransactionStatus({ timeWindow: 60 })
      const subject = transaction.getStatus()

      it('defaults max to 0', () => {
        expect(subject.max).toEqual(0)
      })

      it('defaults min to 0', () => {
        expect(subject.max).toEqual(0)
      })

      it('defaults count to 0', () => {
        expect(subject.max).toEqual(0)
      })

      it('defaults sum to 0', () => {
        expect(subject.max).toEqual(0)
      })

      it('defaults avg to 0', () => {
        expect(subject.max).toEqual(0)
      })
    })
  })
})