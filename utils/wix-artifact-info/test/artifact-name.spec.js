const expect = require('chai').use(require('sinon-chai')).expect,
  artifactName = require('../lib/artifact-name'),
  sinon = require('sinon'),
  {pomXmlWith} = require('./support');

describe('artifact name', () => {

  it('should return groupId, artifactId extracted from pom.xml', () => {
    const readFile = sinon.stub().returns(pomXmlWith('com.test', 'a-name'));

    expect(artifactName(readFile)).to.deep.equal({groupId: 'com.test', artifactId: 'a-name'});
  });
  
  it('should fail if groupId is missing', () => {
    const pomXml = '<project><artifactId>a-name</artifactId></project>>';
    const readFile = sinon.stub().returns(pomXml);

    expect(() => artifactName(readFile)).to.throw('groupId is missing');
  });

  it('should fail if artifactId is missing', () => {
    const pomXml = '<project><groupId>com.wix</groupId></project>>';
    const readFile = sinon.stub().returns(pomXml);

    expect(() => artifactName(readFile)).to.throw('artifactId is missing');
  });
});
