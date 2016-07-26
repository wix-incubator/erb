'use strict';
const expect = require('chai').expect,
  shelljs = require('shelljs'),
  join = require('path').join,
  spawn = require('child_process').spawnSync;

describe('spjs-build', function () {
  this.timeout(60000);

  describe('successful build', () => {
    const moduleDir = setupModule('test-module');

    it('should run all build phases with node version defined in .nvmrc', () => {
      const res = runCmd(moduleDir);

      expect(res.code).to.equal(0);
      expect(res.output).to.be.string('install for test-pkg with node version v6');
      expect(res.output).to.be.string('test for test-pkg with node version v6');
      expect(res.output).to.be.string('test for test-pkg with node version v4');
      expect(res.output).to.be.string('release for test-pkg with node version v6');
    });
  });

  describe('invalid node version', () => {
    const moduleDir = setupModule('module-with-invalid-version-in-nvmrc');

    it('should should fail for invalid node version defined in .nvmrc', () => {
      const res = runCmd(moduleDir);

      expect(res.code).to.equal(1);
      expect(res.output).to.be.string('node version in .nvmrc must be set to "6.2.0"');
    });
  });

  function setupModule(name) {
    const destModule = join(process.cwd(), `./target/${name}`);
    const srcModule = join(process.cwd(), `./test/${name}`);

    beforeEach(() => {
      shelljs.rm('-rf', destModule);
      shelljs.mkdir('-p', destModule);
      shelljs.cp('-R', srcModule + '/', destModule);
      shelljs.cp(srcModule + '/.nvmrc', destModule);
    });

    return destModule
  }

  function runCmd(moduleDir) {
    spawn('sh', ['-c', 'npm link'], {stdio: 'inherit'});
    const res = spawn('sh', ['-c', `pwd && unset npm_config_prefix; . ~/.nvm/nvm.sh --silent; nvm install && npm link ${process.cwd()} && node build.js`], {cwd: moduleDir});
    console.log(res.stdout.toString());
    console.log(res.stderr.toString());
    return {
      code: res.status,
      output: res.stdout.toString() + res.stderr.toString()
    }
  }
});