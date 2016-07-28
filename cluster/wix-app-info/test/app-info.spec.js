'use strict';
const appInfo = require('../lib/app-info'),
  expect = require('chai').expect;

describe('app info', () => {

  it('should fail creating appInfo instalce without "heapDumpTempDir" provided', () => {
    expect(() => appInfo()).to.throw('Heap dump temp directory must be provided, set [heapDumpTempDir] option')
  });

});