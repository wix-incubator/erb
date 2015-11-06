'use strict';
const chai = require('chai'),
  expect = chai.expect,
  Chance = require('chance'),
  chance = new Chance(),
  serializer = require('../lib/serializer');

chai.use(require('./support/matchers'));

describe('rpc protocol serializer', () => {
  let method;
  const serialize = serializer.get(() => 1);

  beforeEach(() => method = chance.string());

  it('should serialize object', () => {
    var method = chance.string();
    var params = [chance.string(), chance.integer()];
    expect(serialize(method, params)).to.be.validRpcRequest(1, method, params);
  });

  it('should serialize object with empty params', () => {
    var method = chance.string();
    expect(serialize(method)).to.be.validRpcRequest(1, method);
  });
});