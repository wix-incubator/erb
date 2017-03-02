const asNumeric = require('../lib/as-numeric'),
  expect = require('chai').expect;

describe('is-numeric', () => {

  it('returns undefined for non-numerics', () => {
    [{}, 'qwe', [], 'q123', null, undefined].forEach(variant => {
      expect(asNumeric(variant)).to.be.undefined;
    });
  });

  it('returns number for numeric values', () => {
    expect(asNumeric('123')).to.equal(123);
    expect(asNumeric(123)).to.equal(123);
    expect(asNumeric(123.11)).to.equal(123.11);
    expect(asNumeric(1e9)).to.equal(1000000000);
  });
});
