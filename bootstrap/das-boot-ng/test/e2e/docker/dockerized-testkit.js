const docker = require('./main');
const {TestkitBase} = require('wix-testkit-base');

class DockerizedTestkit extends TestkitBase {
  constructor(buildContext, imageName, containerName, opts) {
    super();
    this.buildContext = buildContext;
    this.imageName = imageName;
    this.containerName = containerName;
    this.opts = opts;
  }
  
  doStart() {
    return this.build()
      .then(() => this.startContainer());
  }

  doStop() {
    return this.stopContainer();
  }
  
  build() {
    return docker.runDockerCommandWithOutput(`build -t ${this.imageName} ${this.buildContext}`);
  }
  
  startContainer() {
    return docker.runContainer(this.containerName, this.imageName, this.opts)
  }
  
  stopContainer() {
    return docker.removeIfExists(this.containerName, true);
  }
  
  appendConfiguration(configEmitter) {
    return configEmitter;
  }
}

module.exports = DockerizedTestkit;
