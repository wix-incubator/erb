'use strict';
const _ = require('lodash');

module.exports = chai => {
  chai.Assertion.addProperty('asJson', asJson);

  function asJson() {
    let obj;
     try {
       obj = JSON.parse(this._obj);
     } catch (e) {}
    this.assert(
      _.isObject(obj),
      'expected #{this} to be an object',
      'expected #{this} to not be an object',
      this._obj);

    this._obj = obj;
  }
};