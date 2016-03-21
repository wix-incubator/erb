'use strict';
const expect = require('chai').expect,
  exec = require('child_process').execSync;

describe('eslint shared config for mocha', () => {

  it('should pass for valid mocha spec', () => {
      exec('node ./node_modules/eslint/bin/eslint.js -c ./mocha.js ./test/scripts/mocha-valid.js');
  });

  it('should fail on exclusive tests (.only)', () => {
    try {
      exec('node ./node_modules/eslint/bin/eslint.js -c ./mocha.js ./test/scripts/mocha-with-only.js');
    } catch (e) {
      expect(e.stdout.toString()).to.be.string('Unexpected exclusive mocha test');
    }
  });

});