'use strict';
const expect = require('chai').expect,
  exec = require('child_process').execSync;

describe('wix-testkit-base before*() shorthands should be supported in', () => {

  it('mocha', () => {
    const res = JSON.parse(exec('./node_modules/.bin/mocha --reporter=JSON ./test/external-mocha/spec.js').toString());
    expect(res).to.contain.deep.property('stats.tests', 3);
    expect(res).to.contain.deep.property('stats.passes', 3);
  });

  it('jasmine', () => {
    const res = exec('./node_modules/.bin/jasmine JASMINE_CONFIG_PATH=test/external-jasmine/jasmine.json').toString();
    expect(res).to.be.string('3 specs, 0 failures');
  });
});
