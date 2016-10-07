'use strict';
const testkit = require('..'),
  expect = require('chai').use(require('chai-as-promised')).expect;

describe('wix-child-process-testkit spec', () => {

  it('should fail if check is not provided', () => {
    expect(() => testkit.fork('index', {}))
      .to.throw('alive check was not provided - did you pass-in all arguments?');
  });
});