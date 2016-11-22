'use strict';
const expect = require('chai').expect,
  exec = require('child_process').execSync;

describe('eslint shared config for mocha', () => {

  it('should pass for valid es6', () => {
      exec('node ./node_modules/eslint/bin/eslint.js -c ./main.js ./test/scripts/es6-valid.js');
  });

  it('should fail on some violation (unused var)', () => {
    try {
      exec('node ./node_modules/eslint/bin/eslint.js -c ./mocha.js ./test/scripts/es6-unused.js');
    } catch (e) {
      expect(e.stdout.toString()).to.be.string(`'someVar' is assigned a value but never used`);
    }
  });

});
