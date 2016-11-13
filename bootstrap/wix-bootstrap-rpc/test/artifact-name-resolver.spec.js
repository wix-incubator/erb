'use strict';
const expect = require('chai').expect,
  artifactNameResolver = require('../lib/artifact-name-resolver');

describe('artifact name resolver', () => {

  it('should resolve artifact name', () => {
    expect(artifactNameResolver.resolve()).to.equal('wix-bootstrap-rpc');
  });

});