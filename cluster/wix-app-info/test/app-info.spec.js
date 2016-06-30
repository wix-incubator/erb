'use strict';
const appInfo = require('../lib/app-info'),
  expect = require('chai').expect;

describe('app info', () => {

  it('should create app-info', () => {
    expect(appInfo({heapDumpTempDir: 'tmp/dumps'})).to.be.ok
  });

  it('should fail create view without temp dir', () => {
    expect(() => appInfo()).to.throw('Heap dump temp directory must be provided, set [heapDumpTempDir] option')
  });

});