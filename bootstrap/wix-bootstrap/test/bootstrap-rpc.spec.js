'use strict';
const BootstrapRpc = require('../lib/rpc'),
  expect = require('chai').expect,
  configSupport = require('./support/config');

describe('bootstrap rpc', () => {

  //TODO: deprecate
  describe('gets timeout from bootstrap config', () => {
    const config = configSupport.valid();
    expect(new BootstrapRpc(config).factory.timeout).to.equal(config.rpc.defaultTimeout);
  });
});
