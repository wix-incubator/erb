const expect = require('chai').use(require('sinon-chai')).expect,
  artifactVersion = require('../lib/artifact-version'),
  Logger = require('wnp-debug').Logger,
  sinon = require('sinon');

describe('artifact version', () => {

  it('should set to "-" given "ver" file is missing and log error', () => {
    const log = sinon.createStubInstance(Logger);
    const readFile = sinon.stub().throws(new Error('woof woof'));

    expect(artifactVersion(readFile, log)).to.equal('-');
    expect(log.debug).to.have.been.calledWithMatch('will not load artifact version');
  });

  it('should return a version defined in "ver" file on cwd', () => {
    const readFile = sinon.stub().returns('1.0.0');

    expect(artifactVersion(readFile)).to.equal('1.0.0');
  });
});
