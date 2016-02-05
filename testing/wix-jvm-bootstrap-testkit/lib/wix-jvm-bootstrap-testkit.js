'use strict';
const resolve = require('url').resolve,
  shelljs = require('shelljs'),
  path = require('path'),
  unzip = require('unzip'),
  fs = require('fs'),
  TeskitBase = require('wix-testkit-base').TestkitBase,
  testkit = require('wix-childprocess-testkit'),
  Artifact = require('./artifact'),
  fetch = require('node-fetch');

const defaultPort = 3334;
const tmpFolder = path.join(process.cwd(), 'target/jvm');

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
      .then(artifactBundle => extractArtifact(this.artifact, artifactBundle.tmpDir, artifactBundle.artifactFile))
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


function extractArtifact(artifact, targetDir, artifactFile) {
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(artifactFile).pipe(unzip.Extract({path: targetDir}));
    stream.on('close', () => resolve(path.join(targetDir, artifact.extractedFolderName)));
    stream.on('error', err => reject(err));
  });
}

function maybeInjectConfig(config, target) {
  if (config) {
    shelljs.cp(config, path.join(target, '/conf'));
  }
}

function prepareWorkDir(tmpDir) {
  if (shelljs.test('-d', tmpDir)) {
    shelljs.rm('-rf', tmpDir);
  }

  shelljs.mkdir('-p', tmpDir);
  return Promise.resolve(tmpDir);
}

function retrieveArtifact(artifact, tmpDir) {
  let output = shelljs.exec(artifact.fetchCmd(tmpDir));
  let outputFile;

  if (output.code !== 0) {
    throw new Error('mvn org.apache.maven.plugins:maven-dependency-plugin:2.8:copy failed with code:' + output.code);
  }

  try {
    shelljs.pushd(tmpDir);

    let files = shelljs.ls(artifact.deployableFileName);

    if (files && files.length === 1) {
      outputFile = files[0];
      console.log(`downloaded file: ${outputFile}`);
    } else {
      throw new Error(`expected to find downloaded file of pattern ${artifact.deployableFileName} to be at ${tmpDir}, but could not find it.`);
    }

    if (!shelljs.test('-f', outputFile)) {
      throw new Error(`expected ${artifact.outputFilePattern} to be at ${tmpDir}, but could not find it.`);
    }

  } finally {
    shelljs.popd();
  }

  return {
    tmpDir: tmpDir,
    artifactFile: path.join(tmpDir, outputFile)
  };
}
