'use strict';
const _ = require('lodash');

module.exports = (chai) => {
  chai.Assertion.addMethod('match', partialMatchObject);
  chai.Assertion.addMethod('matches', partialMatchObject);
};

function partialMatchObject(partialObject) {
  this.assert(_.isMatch(this._obj, partialObject),
    `expected #{this} to match "${JSON.stringify(partialObject)}"`,
    `expected #{this} to not match "${JSON.stringify(partialObject)}"`,
    partialObject,
    this._obj);
}
