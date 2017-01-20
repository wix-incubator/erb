
const expect = require('chai').expect,
  tags = require('../lib/tags');

describe('tags', () => {
  const sanitize = tags.sanitize;
  const toPath = tags.tagsToPath;

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

  describe('tagsToPath', () => {
    
    it('should validate tag completeness', () => {
      expect(() => toPath()).to.throw('at least 1 tag is mandatory');
      expect(() => toPath([])).to.throw('at least 1 tag is mandatory');
      expect(() => toPath([''])).to.throw('tag is mandatory');
      expect(() => toPath([{}])).to.throw('tag is mandatory');
      expect(() => toPath(['ok=ok', {}])).to.throw('tag is mandatory');
      expect(() => toPath(['ok='])).to.throw('tag key/value is mandatory');
    });

    it('should normalize tag key/value and join into single expression', () => {
      expect(toPath(['ok=ok'])).to.equal('ok=ok');
      expect(toPath(['ok=ok=ok'])).to.equal('ok=ok_ok');
      expect(toPath(['ok=ok.ok'])).to.equal('ok=ok_ok');
      expect(toPath(['ok&ok=ok.ok'])).to.equal('ok_ok=ok_ok');
    });
  });
});
