const expect = require('chai').expect,
  parse = require('../lib/parse-overrides');

describe('parse overrides', () => {

  it('should parse overrides using provided par and key/value separator', () => {
    expect(parse('aKey:aValue', {keyValue: ':', pair: ';'})).to.deep.equal({
      'aKey': 'aValue'
    });
  });

  it('should parse overrides using provided par and key/value separator', () => {
    expect(parse('aKey>aValue<anotherKey>anotherValue', {keyValue: '>', pair: '<'})).to.deep.equal({
      'aKey': 'aValue',
      'anotherKey': 'anotherValue'
    });
  });

  it('should return empty object for undefined', () => {
    expect(parse(undefined, {keyValue: ':', pair: ';'})).to.deep.equal({});
  });

  it('should return empty object for empty input string', () => {
    expect(parse('', {keyValue: ':', pair: ';'})).to.deep.equal({});
  });

  it('should parse multiple values', () => {
    expect(parse('aKey1:aValue1;aKey2:aValue2', {keyValue: ':', pair: ';'})).to.deep.equal({
      aKey1: 'aValue1',
      aKey2: 'aValue2'
    });
  });

  it('should parse multiple values', () => {
    expect(parse('aKey1:aValue1;aKey2:aValue2', {keyValue: ':', pair: ';'})).to.deep.equal({
      aKey1: 'aValue1',
      aKey2: 'aValue2'
    });
  });

  it('should return empty object for input string without matching keyValue separator', () => {
    expect(parse('aKey1aValue1', {keyValue: ':', pair: ';'})).to.deep.equal({});
  });

  it('should return empty object for input string without key', () => {
    expect(parse(' :aValue', {keyValue: ':', pair: ';'})).to.deep.equal({});
  });
});
