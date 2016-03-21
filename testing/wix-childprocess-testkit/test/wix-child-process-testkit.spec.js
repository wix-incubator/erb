'use strict';
const testkit = require('..'),
  chai = require('chai'),
  expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('wix-child-process-testkit spec', () => {

  it.skip('should fail to start given launch file does not exist', () =>
    expect(() => testkit.server('./qweqwe', {}, testkit.checks.httpGet('/')))
      .to.throw('no such file or directory')
  );

  it('should fail if check is not provided', () => {
    expect(() => testkit.server('index', {}))
      .to.throw('alive check was not provided - did you pass-in all arguments?');
  });
});