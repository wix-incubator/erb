'use strict';
const validator = require('../lib/config/config-validator'),
  expect = require('chai').expect,
  _ = require('lodash'),
  configSupport = require('./support/config');

describe('config validator', () => {

  it('should pass for a valid object', () => {
    expect(validator.validate(configSupport.valid())).to.be.empty;
  });

  describe('should fail on root object:', () => {
    [null, undefined, {}, 1, ''].forEach(el => {
      it(`${el}`, () => {
        const res = validator.validate(el);
        expect(res).to.be.instanceof(Error);
        expect(res.message).to.be.string('config is mandatory');
      });
    });
  });

  describe('should fail on missing required objects:', () => {
    [
      'express',
      'express.requestTimeout',
      'session',
      'session.mainKey',
      'rpc',
      'rpc.signingKey',
      'rpc.defaultTimeout'
    ].forEach(el => {

      it(`${el}`, () => {
        const res = validator.validate(configSupport.without(el));
        expect(res).to.be.instanceof(Error);
        expect(res.message).to.be.string(_.last(el.split('.')));
      });
    });
  });

  describe('should fail on invalid types/unmet constraints:', () => {
    [
      withValue('express.requestTimeout', 'str'),
      withValue('express.requestTimeout', -1),
      withValue('express.requestTimeout', {}),
      withValue('session.mainKey', 1),
      withValue('session.mainKey', {}),
      withValue('session.mainKey', ''),
      withValue('rpc.signingKey', 1),
      withValue('rpc.signingKey', {}),
      withValue('rpc.signingKey', ''),
      withValue('rpc.defaultTimeout', 'str'),
      withValue('rpc.defaultTimeout', -1),
      withValue('rpc.defaultTimeout', {})
    ].forEach(el => {

      it(`${el.desc}`, () => {
        const res = validator.validate(el.value);
        expect(res).to.be.instanceof(Error);
        expect(res.message).to.be.string(_.last(el.prop.split('.')));
      });
    });
  });
});

function withValue(prop, value) {
  return {
    prop,
    value: configSupport.withValue(prop, value),
    desc: `${prop} = ${value}`
  };
}
