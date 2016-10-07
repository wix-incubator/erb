'use strict';
const assertExpired = require('../lib/assert-expired'),
  expect = require('chai').expect,
  errors = require('../index').errors;

describe('assert-expired', () => {

  it('should not throw if it has not yet expired', () => {
    const nowPlus1MinuteUTC = new Date(Date.now() + 60*1000);
    assertExpired(nowPlus1MinuteUTC);
  });

  it('should throw if it has expired', () => {
    const nowMinus1MinuteUTC = new Date(Date.now() - 60*1000);
    expect(() => assertExpired(nowMinus1MinuteUTC)).to.throw(errors.SessionExpiredError);
  });
});