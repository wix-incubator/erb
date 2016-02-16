'use strict';
const expect = require('chai').expect,
  seenByUniqueHandler = require('../lib/seen-by-unique-handler');


describe('seen by unique handler', () => {

  it('should return the same array when is already unique', () => {
    expect(seenByUniqueHandler.calc(['a', 'b', 'c'])).to.deep.equal(['a', 'b', 'c']);
  });

  it('should return empty array for empty array', () => {
    expect(seenByUniqueHandler.calc([])).to.deep.equal([]);
  });

  it('should return unique items', () => {
    expect(seenByUniqueHandler.calc(['a', 'b', 'a', 'a'])).to.deep.equal(['a', 'b']);
  });
});
