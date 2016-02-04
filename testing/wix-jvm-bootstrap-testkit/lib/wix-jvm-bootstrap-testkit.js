'use strict';
const request = require('request'),
  resolve = require('url').resolve,
  shelljs = require('shelljs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  unzip = require('unzip'),
  fs = require('fs'),
  TeskitBase = require('wix-testkit-base').TestkitBase,
  Artifact = require('./artifact');

const defaultPort = 3334;
const tmpFolder = path.join(process.cwd(), 'target/jvm');

module.exports = options => new JvmBootstrapServer(options);


class JvmBootstrapServer extends TeskitBase {
  constructor(options) {
    super();
    if (!options) {
      throw new Error('options are mandatory');
    }
    if (!options.artifact) {
      throw new Error('artifact is mandatory');
    }

    this.port = options.port || defaultPort;
    this.config = options.config;
    this.artifact = new Artifact(options.artifact);
  }

  doStart() {
    return prepareWorkDir(tmpFolder)
      .then(tmpDir => retrieveArtifact(this.artifact, tmpDir))
      .then(artifactBundle => extractArtifact(this.artifact, artifactBundle.tmpDir, artifactBundle.artifactFile))
      .then(extractedTo => {
        maybeInjectConfig(this.config, extractedTo);
        return this._start(extractedTo, this.getPort())
      }).then(process => this.process = process);
  }

  doStop() {
    return new Promise((resolve, reject) => {
      this.process.on('close', err => err ? resolve() : reject(err));
      this.process.kill();
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

  _awaitStartup(cb) {
    setTimeout(() => {
      request(this.getUrl('/health/is_alive'), (err, res) => {
        if (err || (res && res.statusCode !== 200)) {
          this._awaitStartup(cb);
        } else {
          cb();
        }
      });
    }, 500);
  }

  _start(dir, port) {
    return new Promise((resolve, reject) => {
      try {
        shelljs.pushd(dir);
        let cmd = this.artifact.runCmd(port);
        let process = spawn(cmd.cmd, cmd.args);

        process.stdout.on('data', data => console.info(data.toString()));
        process.stderr.on('data', data => console.error(data.toString()));
        process.on('error', error => reject(error));

        this._awaitStartup(
          () => resolve(process),
          () => this._awaitStartup(() => resolve(process)));

      } finally {
        shelljs.popd();
      }
    });
  }
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
