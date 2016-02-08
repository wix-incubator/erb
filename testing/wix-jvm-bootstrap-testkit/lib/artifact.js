'use strict';

class Artifact {
  constructor(artifact) {
    this.groupId = artifact.groupId;
    this.artifactId = artifact.artifactId;
    this.version = artifact.version;
    this.packaging = 'jar';
    this.classifier = 'deployable';
  }

  fetchCmd(dir) {
    return `mvn org.apache.maven.plugins:maven-dependency-plugin:2.8:copy -Dartifact=${this.groupId}:${this.artifactId}:${this.version}:${this.packaging}:${this.classifier} -DoutputDirectory=${dir}`;
  }

  get deployableFileName() {
    return `${this.artifactId}-*-${this.classifier}.${this.packaging}`;
  }

  get extractedFileName() {
    return `${this.artifactId}.${this.packaging}`;
  }

  get extractedFolderName() {
    return `${this.artifactId}-${this.version}`;
  }

  runCmd(path, port) {
    return `java -jar ${path}/${this.extractedFileName} --server-port ${port}`;
  }
}

module.exports = Artifact;