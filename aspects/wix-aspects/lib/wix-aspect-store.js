'use strict';
const assert = require('assert');

module.exports = buildAspects;

function buildAspects(data, aspectBuilders) {
  assert.ok(data, 'requestData is mandatory when constructing Aspect');
  assert.ok(aspectBuilders && aspectBuilders.length > 0, 'at least a single aspect builder function needs to be provided.');
  return buildStore(data, aspectBuilders);
}

function buildStore(data, aspectFns) {
  const ret = aspectFns
    .map(aspectFn => aspectFn(data))
    .reduce((prev, curr) => {
      prev[curr.name] = curr;
      return prev;
    }, {});
  return Object.freeze(ret);
}