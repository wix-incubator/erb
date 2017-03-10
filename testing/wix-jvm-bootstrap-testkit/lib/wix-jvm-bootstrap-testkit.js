const resolve = require('url').resolve,
  shelljs = require('shelljs'),
  join = require('path').join,
  TeskitBase = require('wix-testkit-base').TestkitBase,
  testkit = require('wix-childprocess-testkit'),
  buildArtifact = require('./artifact'),
  fetch = require('node-fetch'),
  assert = require('assert');

module.exports = options => new JvmBootstrapServer(options);

class JvmBootstrapServer extends TeskitBase {
  constructor(options) {
    super();
    const opts = Object.assign({port: 3334, timeout: 20000}, options);
    assert(opts.artifact, 'artifact is mandatory');

    this.tmpFolder = join(process.cwd(), 'target');
    this.port = opts.port;
    this.artifact = buildArtifact(opts.artifact);
    this.timeout = opts.timeout;
    this.config = opts.config;
  }

  doStart() {
    return verifyServerNotRunningOnSamePort(this.port)
      .then(() => prepareWorkDir(this.tmpFolder))
      .then(saveToDir => retrieveArtifact(this.artifact, saveToDir))
      .then(extractedTo => maybeInjectConfig(this.config, extractedTo))
      .then(extractedTo => this.artifact.runCmd(extractedTo, this.port))
      .then(cmd => testkit.spawn(cmd, {
        timeout: this.timeout,
        env: {PORT: this.getPort()}
      }, testkit.checks.httpGet('/health/is_alive')))
      .then(server => this.server = server)
      .then(() => this.server.doStart());
  }

  doStop() {
    return this.server.doStop();
  }

  getUrl(path) {
    let url = `http://localhost:${this.getPort()}`;
    return path ? resolve(url, path) : url;
  }

  getPort() {
    return this.port;
  }
}

function verifyServerNotRunningOnSamePort(port) {
  return fetch(`http://localhost:${port}/health/is_alive`)
    .then(() => Promise.reject(Error('had to fail')))
    .catch(err => {
      if (err.message === 'had to fail') {
        throw new Error('another server is listening on same port: ' + port);
      }
    });
}

function maybeInjectConfig(config, target) {
  if (config) {
    shelljs.cp(config, join(target, '/conf'));
  }

  return target;
}

function prepareWorkDir(tmpDir) {
  const jvmDir = join(tmpDir, 'jvm');

  shelljs.mkdir('-p', tmpDir);
  shelljs.rm('-rf', jvmDir);
  shelljs.rm('-rf', join(tmpDir, 'dependency-maven-plugin-markers'));

  return Promise.resolve(jvmDir);
}

function retrieveArtifact(artifact, jvmDir) {
  let output = shelljs.exec(artifact.fetchCmd(jvmDir));

  if (output.code !== 0) {
    throw new Error('mvn org.apache.maven.plugins:maven-dependency-plugin:2.8:unpack failed with code:' + output.code);
  }

  return join(jvmDir, artifact.extractedFolderName);
}
