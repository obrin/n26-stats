const _status = Symbol('status');
const _timeWindow = Symbol('timeWindow');
const _transactions = Symbol('transactions');
const _maxValues = Symbol('maxValues');
const _minValues = Symbol('minValues');

module.exports = class TransactionStatus {
  constructor (opts = {}) {
    this[_timeWindow] = opts.timeWindow || 60
    this[_status] = {
      max: 0,
      min: 0,
      avg: 0,
      sum: 0,
      count: 0
    }

    /**
     * Each index of the array represents the time remaining
     * e.g., transactions with 0 second remaining will be in index 0
     * Several transactions could happen at the same time.
     * And so within each array several transactions could have be made,
     * thus store the transactions in a nested array
     *
     * Example
     * transactions => [[10, 20, 30], [40, 30], [60]]
     * Time Remaining | Transactions Made
     * 0              | $10, $20 and $30
     * 1              | $40 and $30
     * 2              | $60
     */
    this[_transactions] = new Array(this[_timeWindow]).fill(0).map(() => [])
    this[_maxValues] = new Array(this[_timeWindow]).fill(Number.MIN_SAFE_INTEGER)
    this[_minValues] = new Array(this[_timeWindow]).fill(Number.MAX_SAFE_INTEGER)
  }

  remove () {
    const transactions = this[_transactions].shift()
    this[_transactions].push([])

    transactions.forEach((transaction) => {
      this[_status].count--
      this[_status].sum -= transaction
      this[_status].avg = (this[_status].sum / this[_status].count) || 0
    })

    // dequeue
    this[_maxValues].shift()
    this[_maxValues].push(Number.MIN_SAFE_INTEGER)
    this[_minValues].shift()
    this[_minValues].push(Number.MAX_SAFE_INTEGER)

    this[_status].max = this.getMax()
    this[_status].min = this.getMin()
  }

  add (amount, timestamp, currentTime) {
    // does not allow transactions into the future
    if (timestamp > currentTime) {
      return false
    }

    // covert to seconds remaining
    const timeRemaining = Math.floor((timestamp - currentTime) / 1000) + this[_timeWindow]

    if (timeRemaining >= 0) {
      // add new values to the list
      this[_transactions][timeRemaining].push(amount)
      this[_minValues][timeRemaining] = Math.min(this[_minValues][timeRemaining], amount)
      this[_maxValues][timeRemaining] = Math.max(this[_maxValues][timeRemaining], amount)

      // recalculate stats
      this[_status].max = this.getMax()
      this[_status].min = this.getMin()
      this[_status].count++
      this[_status].sum += amount
      this[_status].avg = (this[_status].sum / this[_status].count) || 0

      return true
    }

    return false
  }

  getMax () {
    const max = this[_maxValues].reduce((max, value) => {
      return Math.max(max, value)
    }, Number.MIN_SAFE_INTEGER)

    // default to 0 when there is no transactions left
    return max === Number.MIN_SAFE_INTEGER ? 0 : max
  }

  getMin () {
    const min = this[_minValues].reduce((min, value) => {
      return Math.min(min, value)
    }, Number.MAX_SAFE_INTEGER)

    // default to 0 when there is no transactions left
    return min === Number.MAX_SAFE_INTEGER ? 0 : min
  }

  getStatus () {
    return this[_status]
  }
}
