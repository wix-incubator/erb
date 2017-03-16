const {expect} = require('chai'),
  artifactInfo = require('..'),
  {withCleanWorkingDir, givenVersion, givenPomXml} = require('./support'),
  log = require('wnp-debug')('for-tests');

describe('artifact info', () => {
  const cwd = withCleanWorkingDir('artifact-info-cwd');

  it('should resolve artifact from underlying resources', () => {
    givenVersion(cwd, '1.2.3');
    givenPomXml(cwd, {groupId: 'com.test', name: 'name-in-pom'});

    expect(artifactInfo(cwd, log)).to.deep.equal({
      name: 'name-in-pom',
      namespace: 'com.test',
      version: '1.2.3'
    });
  });

  it('should validate cwd, log arguments', () => {
    expect(() => artifactInfo()).to.throw('cwd is mandatory');
    expect(() => artifactInfo({})).to.throw('cwd is mandatory');
    expect(() => artifactInfo('./')).to.throw('log is mandatory');
  });
});
