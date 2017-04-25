const extractCsrfSecret = require('../lib/extract-csrf-secret'),
  Tokens = require('csrf'),
  {expect} = require('chai');

describe('extract csrf secret', () => {

  it('should return the secret when it is provided in the header', () => {
    const tokens = new Tokens();

    const secret = tokens.secretSync();
    const headers = {
      'x-xsrf-token': secret
    };

    expect(tokens.verify(secret, extractCsrfSecret({headers}))).to.equal(true);
    expect(extractCsrfSecret({headers})).to.not.eql('');
  });

  it('should not return the secret when it is not provided in the header', () => {
    const tokens = new Tokens();

    const secret = tokens.secretSync();
    const headers = {};

    expect(tokens.verify(secret, extractCsrfSecret({headers}))).to.equal(false);
    expect(extractCsrfSecret({headers})).to.equal('');
  });
});
