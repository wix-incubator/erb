'use strict';
const expect = require('chai').expect,
  shelljs = require('shelljs'),
  join = require('path').join,
  spawn = require('child_process').spawnSync;

describe('spjs-build', function () {
  this.timeout(60000);

  const destModule = join(process.cwd(), './target/test-module');
  const srcModule = join(process.cwd(), './test/test-module');

  beforeEach(() => {
    shelljs.rm('-rf', destModule);
    shelljs.mkdir('-p', destModule);
    shelljs.cp('-R', srcModule + '/', destModule);
    shelljs.cp(srcModule + '/.nvmrc', destModule);
  });

  it('should run all build phases with node version defined in .nvmrc', () => {
    const res = runCmd();

    expect(res.code).to.equal(0);
    expect(res.output).to.be.string('install for test-pkg with node version v6');
    expect(res.output).to.be.string('test for test-pkg with node version v6');
    expect(res.output).to.be.string('test for test-pkg with node version v4');
    expect(res.output).to.be.string('release for test-pkg with node version v6');
  });

  function runCmd() {
    spawn('sh', ['-c', 'npm link'], {stdio: 'inherit'});
    const res = spawn('sh', ['-c', `pwd && unset npm_config_prefix; . ~/.nvm/nvm.sh --silent; nvm install && npm link ${process.cwd()} && npm install && node build.js`], {cwd: destModule});
    return {
      code: res.status,
      output: res.stdout.toString()
    }
  }
});