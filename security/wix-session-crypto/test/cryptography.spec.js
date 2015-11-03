'use strict';
const crypto = require('../lib/cryptography'),
  Chance = require('chance'),
  chance = new Chance(),
  expect = require('chai').expect;

describe('cryptography', () => {
  let data;

  beforeEach(() => {
    data = chance.string();
  });

  it('should encrypt and decrypt', () => {
    let keys = {mainKey: aKey()};
    let encrypted = crypto.encrypt(data, keys);

    expect(crypto.decrypt(encrypted, keys)).to.equal(data);
  });

  it('should decrypt data encrypted with alternateKey', () => {
    let encryptKeys = {mainKey: aKey()};
    let decryptKeys = {mainKey: aKey(), alternateKey: encryptKeys.mainKey};
    let encrypted = crypto.encrypt(data, encryptKeys);

    expect(crypto.decrypt(encrypted, decryptKeys)).to.equal(data);
  });

  it('should fail to decrypt with non-matching keys', function () {
    let encryptKeys = {mainKey: aKey()};
    let decryptKeys = {mainKey: aKey(), alternateKey: aKey()};
    let encrypted = crypto.encrypt(data, encryptKeys);

    expect(() => crypto.decrypt(encrypted, decryptKeys)).to.throw(Error);
  });

  function aKey() {
    return chance.string({'length': 16});
  }
});

