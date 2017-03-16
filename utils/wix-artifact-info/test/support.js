const shelljs = require('shelljs'),
  join = require('path').join;

module.exports.givenVersion = (cwd, version) => {
  shelljs.echo(version).to(join(cwd, 'ver'));
};

module.exports.withCleanWorkingDir = id => {
  const cwd = `./target/${id}`;

  before(() => {
    shelljs.rm('-rf', cwd);
    shelljs.mkdir('-p', cwd);
  });

  return cwd;
};

module.exports.pomXmlWith = (groupId, name) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>${groupId}</groupId>
    <artifactId>${name}</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>
  </project>`;
};

module.exports.givenPomXml = (cwd, {groupId, name}) => {
  shelljs.echo(module.exports.pomXmlWith(groupId, name)).to(join(cwd, 'pom.xml'));
};
