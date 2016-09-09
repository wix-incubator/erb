'use strict';
const measured = require('measured');

class Throttler {
  constructor(cluster) {
    this._forked = new measured.Meter({rateUnit: 60000});
    cluster.on('fork', () => this._forked.mark());
  }

  shouldThrottle() {
    const current = this._forked.toJSON();
    return (current.count > 5 && current.currentRate > 20);
  }
}

module.exports = Throttler;