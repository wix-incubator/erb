'use strict';
const assert = require('assert');

module.exports = class Aspect {
  constructor(name, data) {
    this._aspect = {};
    this._name = name;
    assert.ok(name, 'name is mandatory when constructing Aspect');
    assert.ok(data, 'requestData is mandatory when constructing Aspect');
  }

  get name() {
    return this._name;
  }

  export() {
    return {};
  }

  import() {
  }

  toJSON() {
    return this._aspect;
  }

  _setIfAny(src, targetObj, targetKey) {
    if (src) {
      targetObj[targetKey] = src;
    }
  }
};