'use strict';
const _ = require('lodash'),
  crypto = require('wix-crypto');

const delimiter = '###';
const sessionTemplate = {
  uid: 0,
  userGuid: 1,
  userName: 2,
  email: 3,
  mailStatus: 4,
  isWixStaff: 5,
  permissions: 6,
  userCreationDate: 7,
  version: 8,
  userAgent: 9,
  isRemembered: 10,
  expiration: 11,
  colors: {}
};

module.exports.devKeys = {
  main: '1qaz2wsx3edc4rfv'
};

module.exports.get = (mainKey, alternateKey) => {
  return new WixSessionCrypto(mainKey, alternateKey);
};

class WixSessionCrypto {
  constructor(mainKey, alternateKey) {
    if (!mainKey) {
      throw new Error('mainKey is mandatory');
    }

    this.options = {mainKey, alternateKey};
  }

  decrypt(token) {
    const elements = crypto
      .decrypt(token, this.options)
      .split(delimiter);
    const wixSession = {};

    _.each(sessionTemplate, (index, key) => {
      wixSession[key] = this._decorateSessionValue(key, elements[index]);
    });

    return wixSession;
  }

  encrypt(session) {
    const tokenValues = [];

    _.each(sessionTemplate, (index, key) => {
      let value = session[key];
      tokenValues.push((value instanceof Date) ? value.getTime() : value);
    });

    tokenValues[tokenValues.length - 1] = JSON.stringify(session.colors);

    return crypto.encrypt(tokenValues.join(delimiter), this.options);
  }

  _decorateSessionValue(key, value) {
    var retVal = null;
    switch (key) {
      case 'uid':
      case 'version':
        retVal = parseInt(value, 10);
        break;
      case 'permissions':
        retVal = parseInt(value, 10);
        break;
      case 'isWixStaff':
      case 'isRemembered':
        retVal = value === 'true';
        break;
      case 'userCreationDate':
      case 'expiration':
        retVal = new Date(parseFloat(value));
        break;
      case 'colors':
        retVal = {};
        break;
      default:
        retVal = value;
    }
    return retVal;
  }
}