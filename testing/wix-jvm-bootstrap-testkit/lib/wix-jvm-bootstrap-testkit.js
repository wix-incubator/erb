'use strict';
const request = require('request'),
  resolve = require('url').resolve,
  shelljs = require('shelljs'),
  path = require('path'),
  spawn = require('child_process').spawn,
  unzip = require('unzip'),
  fs = require('fs');

const defaultPort = 3334;
const tmpFolder = path.join(process.cwd(), 'target/jvm');

module.exports.defaultPort = defaultPort;
module.exports = options => new JvmBootstrapServer(options);


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
    return `${this.artifactId}-${this.version}-${this.classifier}.${this.packaging}`;
  }

  get extractedFileName() {
    return `${this.artifactId}.${this.packaging}`;
  }

  get extractedFolderName() {
    return `${this.artifactId}-${this.version}`;
  }


  runCmd(port) {
    return {
      cmd: 'java',
      args: ['-jar', this.extractedFileName, '--server-port', port]
    };
  }
}

class JvmBootstrapServer {
  constructor(options) {
    if (!options) {
      throw new Error('options are mandatory');
    }
    if (!options.artifact) {
      throw new Error('artifact is mandatory');
    }

    this.port = options.port || defaultPort;
    this.artifact = new Artifact(options.artifact);
  }

  listen(cb) {
    this._prepare();
    let archive = this._fetch();
    this._extract(this.artifact, archive, tmpFolder, (err, extractedDir) => {
      if (err) {
        throw err;
      }

      this.process = this._start(extractedDir, this.getPort(), (process) => {
        this.process = process;
        cb();
      });
    });
  }

  close(cb) {
    if (!this.process) {
      throw new Error('process has not been started');
    } else {
      this.process.on('close', () => cb());
      this.process.kill();
    }
  }

  beforeAndAfter() {
    before(done => this.listen(done));
    after(done => this.close(done));
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

  _prepare() {
    if (shelljs.test('-d', tmpFolder)) {
      shelljs.rm('-rf', tmpFolder);
    }

    shelljs.mkdir('-p', tmpFolder);
  }

  _fetch() {
    let output = shelljs.exec(this.artifact.fetchCmd(tmpFolder));
    let outputFile = path.join(tmpFolder, this.artifact.deployableFileName);

    if (output.code !== 0) {
      throw new Error('mvn org.apache.maven.plugins:maven-dependency-plugin:2.8:copy failed with code:' + output.code);
    }

    if (!shelljs.test('-f', outputFile)) {
      throw new Error(`expected ${this.artifact.deployableFileName} to be at ${tmpFolder}, but could not find it.`);
    }

    return outputFile;
  }

  _extract(artifact, src, target, cb) {
    let stream = fs.createReadStream(src).pipe(unzip.Extract({path: target}));

    stream.on('close', () => {
      cb(null, path.join(tmpFolder, artifact.extractedFolderName));
    });

    stream.on('error', err => {
      cb(err);
    });
  }

  _awaitStartup(cb) {
    setTimeout(() => {
      request(this.getUrl('/health/is_alive'), (err, res, body) => {
        if (err || (res && res.statusCode !== 200)) {
          this._awaitStartup(cb);
        } else {
          cb();
        }
      });
    }, 500);
  }

  _start(dir, port, cb) {
    try {
      shelljs.pushd(dir);
      let cmd = this.artifact.runCmd(port);
      let process = spawn(cmd.cmd, cmd.args);

      process.stdout.on('data', data => console.info(data.toString()));
      process.stderr.on('data', data => console.error(data.toString()));
      process.on('error', error => {
        throw new Error(error);
      });

      this._awaitStartup(
        () => cb(process),
        () => this._awaitStartup(() => cb(process)));

    } finally {
      shelljs.popd();
    }
  }

}