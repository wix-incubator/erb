'use strict';
const empty = require('./support/fixtures').empty,
  expect = require('chai').expect,
  packageJson = require('../package.json');

describe('octo', function() {
  this.timeout(10000);

  it('should print usage with custom help for --help', () => {
    empty().inDir(ctx => {
      const out = ctx.octo('--help');

      expect(out).to.be.string('Usage: octo [options] [command]');
      expect(out).to.be.string('|(@)(@)|');
    });
  });

  it('should display help by default', () => {
    empty().inDir(ctx => {
      const out = ctx.octo();

      expect(out).to.be.string('Usage: octo [options] [command]');
      expect(out).to.be.string('|(@)(@)|');
    });
  });

  it('should print version from package.json', () => {
    empty().inDir(ctx => {
      const out = ctx.octo('-V');

      expect(out).to.be.string(packageJson.version);
    });
  });

  it.skip('should allow execution from sub-folder of project');
});