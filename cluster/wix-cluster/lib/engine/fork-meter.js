const measured = require('measured');

const oneMinute = 60*1000;

module.exports = class Throttler {
  constructor() {
    this._now = Date.now();
    this._forked = new measured.Meter({rateUnit: 60000});
  }

  mark() {
    this._forked.mark();
  }

  shouldThrottle() {
    const current = this._forked.toJSON();
    return ((this._now + oneMinute > Date.now()) && current.count > 5 && current.currentRate >= 20);
  }
};