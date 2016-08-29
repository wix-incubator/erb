'use strict';
const resolve = require('url').resolve,
  shelljs = require('shelljs'),
  path = require('path'),
  join = path.join,
  TeskitBase = require('wix-testkit-base').TestkitBase,
  testkit = require('wix-childprocess-testkit'),
  Artifact = require('./artifact'),
  fetch = require('node-fetch');

const defaultPort = 3334;
const tmpFolder = path.join(process.cwd(), 'target');

module.exports = options => new JvmBootstrapServer(options);


class JvmBootstrapServer extends TeskitBase {
  constructor(options) {
    super();
    const opts = options || {};
    if (!opts.artifact) {
      throw new Error('artifact is mandatory');
    }

    // TODO: setting it extra high value so that on slow connections it does not terminate download
    // maybe separate start-up timeout from download, as timeout or drop it altogether.
    this.timeout = opts.timeout || 600000;
    this.port = opts.port || defaultPort;
    this.config = opts.config;
    this.artifact = new Artifact(opts.artifact);
  }

  doStart() {
    return verifyServerNotRunningOnSamePort(this.port)
      .then(() => prepareWorkDir(tmpFolder))
      .then(tmpDir => retrieveArtifact(this.artifact, tmpDir))
      .then(extractedTo => {
        maybeInjectConfig(this.config, extractedTo);
        const cmd = this.artifact.runCmd(extractedTo, this.getPort());
        this.process = testkit.server(cmd.split(' '), { timeout: this.timeout, env: {PORT: this.getPort()}}, testkit.checks.httpGet('/health/is_alive'));
        return this.process.doStart();
      });
  }

  doStop() {
    return this.process.doStop();
  }

  getUrl(path) {
    let url = `http://localhost:${this.getPort()}`;
    if (path) {
      url = resolve(url, path);
    }
    return url;
  }

  getPort() {
    return this.port;
  }

  get isRunning() {
    return this.process.isRunning;
  }
}

function verifyServerNotRunningOnSamePort(port) {
  return fetch(`http://localhost:${port}/health/is_alive`)
    .then(() => Promise.reject(Error('had to fail')))
    .catch(err => {
      if (err.message === 'had to fail') {
        throw new Error('another server is listening on same port: ' + port);
      } else {
        Promise.resolve();
      }
    });
}

function maybeInjectConfig(config, target) {
  if (config) {
    shelljs.cp(config, path.join(target, '/conf'));
  }
}

function prepareWorkDir(tmpDir) {
  shelljs.mkdir('-p', tmpDir);
  return Promise.resolve(tmpDir);
}

function retrieveArtifact(artifact, tmpDir) {
  const jvmDir = path.join(tmpDir, 'jvm');
  shelljs.rm('-rf', jvmDir);
  shelljs.rm('-rf', path.join(tmpDir, 'dependency-maven-plugin-markers'));

  let output = shelljs.exec(artifact.fetchCmd(jvmDir));

  if (output.code !== 0) {
    throw new Error('mvn org.apache.maven.plugins:maven-dependency-plugin:2.8:unpack failed with code:' + output.code);
  }

  return path.join(jvmDir, artifact.extractedFolderName);
}