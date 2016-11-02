'use strict';
const expect = require('chai').expect,
  tags = require('../lib/tags');

describe('tags', () => {
  const sanitize = tags.sanitize;
  const toPrefix = tags.tagsToPrefix;

  describe('sanitize', () => {

    it('should not replace - and regular alphanumeric characters', () =>
      expect(sanitize('a-B12')).to.equal('a-B12')
    );

    it('should replace invalid characters with _', () => {
      expect(sanitize('.')).to.equal('_');
      expect(sanitize('=')).to.equal('_');
      expect(sanitize('http://')).to.equal('http___');
      expect(sanitize('1.2.3')).to.equal('1_2_3');
      expect(sanitize('.a.B.-_C')).to.equal('_a_B_-_C');
    });
  });

  describe('tagsToPrefix', () => {

    it('should return empty string for falsy input', () => {
      expect(toPrefix()).to.equal('');
      expect(toPrefix(null)).to.equal('');
      expect(toPrefix({})).to.equal('');
    });

    it('should convert single tag', () => {
      expect(toPrefix({aKey: 'aValue'})).to.equal('aKey=aValue');
    });

    it('should convert multiple tags ordered alphabetically by key', () => {
      expect(toPrefix({bKey: 'aValue', aKey: 'aValue'})).to.equal('aKey=aValue.bKey=aValue');
    });

    it('should sanitize keys and values', () => {
      expect(toPrefix({'b.Key': 'aVa=lue'})).to.equal('b_Key=aVa_lue');
    });
  });
});