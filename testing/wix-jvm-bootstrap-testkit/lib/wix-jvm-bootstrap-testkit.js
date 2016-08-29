'use strict';
const resolve = require('url').resolve,
  shelljs = require('shelljs'),
  path = require('path'),
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

    this.timeout = opts.timeout || 15000;
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
        this.process = testkit.server(__dirname + '/launcher', {
          timeout: this.timeout,
          env: {JVM_TESTKIT_CMD: this.artifact.runCmd(extractedTo, this.getPort()), PORT: this.getPort()}
        }, testkit.checks.httpGet('/health/is_alive'));

        return this.process.doStart();
      });
  }

  doStop() {
    return new Promise((resolve, reject) => {
      if (this.process) {
        this.process.child().send({type: 'jvm-testkit-kill-yourself'});
        setTimeout(() => {
          this.process.doStop().then(() => resolve()).catch(err => reject(err));
        }, 500);
      } else {
        resolve();
      }
    });
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
