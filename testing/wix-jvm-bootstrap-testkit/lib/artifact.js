'use strict';
const packaging = 'jar';
const classifier = 'deployable';

module.exports = artifactDef => {
  return {
    fetchCmd: dir => `mvn org.apache.maven.plugins:maven-dependency-plugin:2.8:unpack -Dartifact=${artifactDef.groupId}:${artifactDef.artifactId}:${artifactDef.version}:${packaging}:${classifier} -DoutputDirectory=${dir} -DoutputAbsoluteArtifactFilename=false`,
    runCmd: (path, port) => `java -jar ${path}/${artifactDef.artifactId}.${packaging} --server-port ${port} --shutdown-delay 0`,
    extractedFolderName: `${artifactDef.artifactId}-${artifactDef.version}`
  }
};