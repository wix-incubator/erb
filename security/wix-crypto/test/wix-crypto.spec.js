'use strict';
const crypto = require('..'),
  Chance = require('chance'),
  chance = new Chance(),
  expect = require('chai').expect,
  AES_128_ECB = crypto.AES_128_ECB;

describe('wix-crypto', () => {
  let data;

  beforeEach(() => data = chance.string());

  it('should fail to decrypt with non-matching keys', () => {
    let encryptKeys = {mainKey: aKey()};
    let decryptKeys = {mainKey: aKey(), alternateKey: aKey()};
    let encrypted = crypto.encrypt(data, encryptKeys);

    expect(() => crypto.decrypt(encrypted, decryptKeys)).to.throw(Error);
  });

  it('should default to "AES 128 ECB" if algorithm is not provided', () => {
    let encryptOpts = {mainKey: aKey()};
    let decryptOpts = {
      mainKey: encryptOpts.mainKey,
      algorithm: AES_128_ECB
    };
    let encrypted = crypto.encrypt(data, encryptOpts);

    expect(crypto.decrypt(encrypted, decryptOpts)).to.equal(data);
  });

  describe('AES-128-ECB', () => {
    it('should encrypt and decrypt', () => {
      let opts = {
        mainKey: aKey(),
        algorithm: AES_128_ECB
      };
      let encrypted = crypto.encrypt(data, opts);

      expect(crypto.decrypt(encrypted, opts)).to.equal(data);
    });

    it('should decrypt data encrypted with alternateKey', () => {
      let encryptOpts = {
        mainKey: aKey(),
        algorithm: AES_128_ECB
      };
      let decryptOpts = {
        mainKey: aKey(),
        alternateKey: encryptOpts.mainKey,
        algorithm: AES_128_ECB
      };
      let encrypted = crypto.encrypt(data, encryptOpts);

      expect(crypto.decrypt(encrypted, decryptOpts)).to.equal(data);
    });
  });

  function aKey() {
    return chance.string({'length': 16});
  }
});
