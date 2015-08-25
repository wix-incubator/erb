// ignore the lint error of not having a function call.
// Mocha actually uses property getters as function calls (like .empty) and lint see those as errors by default
/*jshint -W030 */
module.exports = function (chai) {
  var expect = chai.expect;
  var Assertion = chai.Assertion;
  Assertion.addProperty('aDateString', function() {
    var date = Date.parse(this._obj);
    this.assert(
      !isNaN(date),
      'expected #{this} to be a Date string',
      'expected #{this} to not be a Date string');
  });

  Assertion.addProperty('asErrorMessages', function() {
    var self = this;
    var newArray = this._obj.map(function(error) {
      self.assert(
        error instanceof Error,
        'expected #{this} to be an instance of Error',
        'expected #{this} to not be an instance of Error');
      return error.message;
    });
    this._obj = newArray;
  });

  Assertion.addMethod("metric", function metricAssertion(opts) {
    expect(this._obj.operationName, "metric.operationName").to.be.equal(opts.operationName);
    expect(this._obj.startTime, "metric.startTime").to.be.aDateString;
    expect(this._obj.timeToFirstByte, "metric.timeToFirstByte").to.be.a(opts.timeToFirstByte);
    expect(this._obj.finish, "metric.finish").to.be.a(opts.finish);
    expect(this._obj.timeout, "metric.timeout").to.be.an(opts.timeout);
    expect(this._obj.errors, "metric.errors").asErrorMessages.to.be.deep.equal(opts.errors);
  });
};