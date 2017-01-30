const expect = require('chai').expect,
  sanitize = require('../lib/sanitize');

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
