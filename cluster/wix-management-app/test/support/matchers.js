'use strict';
const _ = require('lodash');

module.exports = (chai) => {
  chai.Assertion.addMethod('match', partialMatchObject);
  chai.Assertion.addMethod('matches', partialMatchObject);
};

function partialMatchObject(partialObject) {
  const obj = _.isString(this._obj) ? JSON.parse(this._obj) : this._obj;

  this.assert(_.isMatch(obj, partialObject),
    `expected #{this} to match "${JSON.stringify(partialObject)}"`,
    `expected #{this} to not match "${JSON.stringify(partialObject)}"`,
    partialObject,
    obj);
}
