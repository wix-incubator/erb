'use strict';
module.exports = chai => {
  var expect = chai.expect;

  chai.Assertion.addMethod('aDateString', aDateString);
  chai.Assertion.addProperty('asErrorMessages', asErrorMessages);
  chai.Assertion.addMethod('metric', metricAssertion);

  function aDateString() {
    const date = Date.parse(this._obj);
    this.assert(
      !isNaN(date),
      'expected #{this} to be a Date string',
      'expected #{this} to not be a Date string');
  }

  function asErrorMessages() {
    const newArray = this._obj.map(error => {
      this.assert(
        error instanceof Error,
        'expected #{this} to be an instance of Error',
        'expected #{this} to not be an instance of Error');
      return error.message;
    });
    this._obj = newArray;
  }

  function metricAssertion(opts) {
    expect(this._obj.operationName, 'metric.operationName').to.equal(opts.operationName);
    expect(this._obj.startTime, 'metric.startTime').to.be.aDateString();
    expect(this._obj.timeToFirstByteMs, 'metric.timeToFirstByteMs').to.be.a(opts.timeToFirstByteMs);
    expect(this._obj.durationMs, 'metric.durationMs').to.be.a(opts.durationMs);
    expect(this._obj.timeout, 'metric.timeout').to.be.equal(opts.timeout);
    expect(this._obj.errors, 'metric.errors').asErrorMessages.to.deep.equal(opts.errors);
  }
};

