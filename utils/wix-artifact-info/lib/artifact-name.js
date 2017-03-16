const xmlDoc = require('xmldoc'),
  assert = require('assert');

const POM_XML_FILE_NAME = 'pom.xml';

module.exports = readFile => {
  const pomXmlString = readFile(POM_XML_FILE_NAME);
  const pomXmlDocument = new xmlDoc.XmlDocument(pomXmlString);

  const groupId = pomXmlDocument.valueWithPath('groupId');
  const artifactId = pomXmlDocument.valueWithPath('artifactId');

  assert(groupId, 'groupId is missing');
  assert(artifactId, 'artifactId is missing');


  return {groupId, artifactId};
};
