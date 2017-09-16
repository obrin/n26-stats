class Stack {
  constructor () {
    this.stack = []
    this.length = this.stack.length
  }

  peek () {
    return this.stack[this.stack.length - 1]
  }

  pop (value) {
    return this.stack.pop(value)
  }

  push (value) {
    return this.stack.push(value)
  }
}

const _status = Symbol('status');
const _timeWindow = Symbol('timeWindow');
const _transactionQueue = Symbol('transactionQueue');
const _maxQueueStack = Symbol('maxQueueStack');
const _minQueueStack = Symbol('minQueueStack');

module.exports = class TransactionStatus {
  constructor (opts = {}) {
    this.timeWindow = opts.timeWindow || 60

    this.max = 0
    this.min = 0
    this.avg = 0
    this.sum = 0
    this.count = 0

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
     * transactionQueue => [[10, 20, 30], [40, 30], [60]]
     * Time Remaining | Transactions Made
     * 0              | $10, $20 and $30
     * 1              | $40 and $30
     * 2              | $60
     */
    this[_transactionQueue] = new Array(this.timeWindow).fill(0).map(() => [])

    /**
     * Each queue will contain a stack of min/max values
     * Each index of the array represents the time remaining
     */
    this[_maxQueueStack] = new Array(this.timeWindow).fill(0).map(() => new Stack())
    this[_minQueueStack] = new Array(this.timeWindow).fill(0).map(() => new Stack())
  }

  remove () {
    const transactions = this[_transactionQueue].shift()
    this[_transactionQueue].push([])

    transactions.forEach((transaction) => {
      this[_status].count--
      this[_status].sum -= transaction
      this[_status].avg = (this[_status].sum / this[_status].count) || 0
    })

    // dequeue
    this[_maxQueueStack].shift()
    this[_maxQueueStack].push(new Stack())
    this[_minQueueStack].shift()
    this[_minQueueStack].push(new Stack())

    this[_status].max = this.getMax()
    this[_status].min = this.getMin()
  }

  add (amount, timestamp, currentTime) {
    // does not allow transactions into the future
    if (timestamp > currentTime) {
      return false
    }

    // covert to seconds
    const timeRemaining = Math.floor((timestamp - currentTime) / 1000) + this[_timeWindow]

    if (timeRemaining >= 0) {
      this[_transactionQueue][timeRemaining].push(amount)

      const maxStack = this[_maxQueueStack][timeRemaining]

      if (maxStack.peek() === undefined || amount >= maxStack.peek()) {
        maxStack.push(amount)
      }

      const minStack = this[_minQueueStack][timeRemaining]

      if (minStack.peek() === undefined || amount <= minStack.peek()) {
        minStack.push(amount)
      }

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
    const max = this[_maxQueueStack].reduce((max, maxStack) => {
      return Math.max(max, maxStack.peek() || Number.MIN_SAFE_INTEGER)
    }, Number.MIN_SAFE_INTEGER)

    // default to 0 when there is no transactions left
    return max === Number.MIN_SAFE_INTEGER ? 0 : max
  }

  getMin () {
    const min = this[_minQueueStack].reduce((min, minStack) => {
      return Math.min(min, minStack.peek() || Number.MAX_SAFE_INTEGER)
    }, Number.MAX_SAFE_INTEGER)

    // default to 0 when there is no transactions left
    return min === Number.MAX_SAFE_INTEGER ? 0 : min
  }

  getStatus () {
    return this[_status]
  }
}
