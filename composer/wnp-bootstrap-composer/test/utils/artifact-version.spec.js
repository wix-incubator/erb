const expect = require('chai').use(require('sinon-chai')).expect,
  artifactVersion = require('../../lib/utils/artifact-version'),
  join = require('path').join,
  Logger = require('wnp-debug').Logger,
  sinon = require('sinon'),
  shelljs = require('shelljs');

describe('artifact version', () => {
  const cwd = shelljs.tempdir();
  beforeEach(() => shelljs.rm('-f', join(cwd, 'ver')));

  it('should set to "-" given "ver" file is missing and log error', () => {
    const log = sinon.createStubInstance(Logger);
    
    expect(artifactVersion(cwd, log)).to.equal('-');
    expect(log.debug).to.have.been.calledWithMatch('will not load artifact version');
  });

  it('should return a version defined in "ver" file on cwd', () => {
    givenAVersionFile('1.0.0');

    expect(artifactVersion(cwd)).to.equal('1.0.0');
  });

  function givenAVersionFile(str) {
    shelljs.echo(str).to(join(cwd, 'ver'));
  }
});

