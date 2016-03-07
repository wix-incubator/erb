'use strict';
const _ = require('lodash');

module.exports = chai => {
  chai.Assertion.addMethod('validGuid', validGuid);
  chai.Assertion.addMethod('likeObject', likeObject);
};

function validGuid() {
  this.assert(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(this._obj),
    'expected #{this} to be a valid guid',
    'expected #{this} to not be a valid guid',
    this._obj);
}

function likeObject(obj) {
  const res = _.merge({}, this._obj, obj);

  this.assert(
    _.isEqual(this._obj, res),
    `expected #{this} to be contain same properties as ${JSON.stringify(obj)}`,
    `expected #{this} to not contain same properties as ${JSON.stringify(obj)}`,
    this._obj, obj);
}