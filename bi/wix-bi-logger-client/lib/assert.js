'use strict';

function assertDefined(target, message) {
  if (target === undefined) {
    throw new AssertionError(message);
  }
}

function assertObject(target, message) {
  if (target !== undefined && (typeof target !== 'object' || Array.isArray(target) || target === null)) {
    throw new AssertionError(message);
  }
}

function assertOk(target, message) {
  if (!target) {
    throw new AssertionError(message);
  }
}

class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports.defined = assertDefined;
module.exports.object = assertObject;
module.exports.ok = assertOk;
module.exports.AssertionError = AssertionError;
