const expect = require('chai').expect,
  wixHmacSigner = require('..');

describe('wix hmac signer', () => {
  const signer = wixHmacSigner.get('1234567890123456');
  const text = 'hi, I am going to be signed';
  const anotherText = 'hi, i am another text';

  it('should sign a string', () => {
    expect(sign(text)).to.equal('e9fe8a2f598bf3831bff2a62abbdbe200edcc7bb');
  });

  it('should sign a buffer', () => {
    expect(sign(new Buffer(text))).to.equal('e9fe8a2f598bf3831bff2a62abbdbe200edcc7bb');
  });

  it('should sign array of strings', () => {
    expect(sign([text, anotherText])).to.equal('df092169db51efdb3f707f89ae1a4ffaaf83077b');
  });

  it('should sign array of buffers', () => {
    expect(sign([new Buffer(text), new Buffer(anotherText)])).to.equal('df092169db51efdb3f707f89ae1a4ffaaf83077b');
  });

  function sign(data) {
    return signer.sign(data);
  }
});
