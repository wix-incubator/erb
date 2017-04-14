const fs = require('fs'),
  shelljs = require('shelljs'),
  path = require('path'),
  ZipStream = require('zip-stream');

const READY = 'READY',
  PENDING = 'PENDING';

module.exports = class ProfilingResourcesManager {
  constructor({folder, resourceGenerator}) {
    this._folder = folder;
    this._resourceGenerator = resourceGenerator;
    shelljs.mkdir('-p', this._folder);
  }

  generate(opts) {
    const now = (opts && opts.now) || Date.now();
    const id = this._resourceGenerator.generateResourceId(now, opts);
    const pendingFile = this._toPath(id, PENDING);
    const readyFile = this._toPath(id, READY);

    fs.writeFileSync(pendingFile, '');

    return this._resourceGenerator.takeSnapshot(id, opts)
      .then(snapshot => {
        return promisify(snapshot.export.bind(snapshot))()
          .then(result => archive(result, this._filenameInArchive(now), pendingFile))
          .then(() => {
            fs.renameSync(pendingFile, readyFile);
            snapshot.delete();
            return this._fromPath(readyFile);
          });
      })
  }

  list() {
    return promisify(fs.readdir)(this._folder)
      .then((result) => result.map(this._fromPath.bind(this)).sort((a, b) => b.id.localeCompare(a.id)));
  }

  get(id) {
    return promisify(fs.readFile)(this._toPath(id, READY))
  }

  _fromPath(profilePath) {
    const extension = path.extname(profilePath),
      id = path.basename(profilePath, extension),
      status = extension.substring(1).toUpperCase(),
      resource = this._resourceGenerator.deserializeResourceFromId(id);
    return {id, status, resource};
  }

  _toPath(id, status) {
    return `${this._folder}/${id}.${status.toLowerCase()}`;
  }

  _filenameInArchive(timestamp) {
    const humanDate = new Date(timestamp).toISOString().replace(/:/g, '-');
    return `${humanDate}.${this._resourceGenerator.resourceType()}`
  }
};

function archive(contents, filename, toPath) {
  return new Promise((resolve, reject) => {
    const archiver = new ZipStream();
    archiver.on('error', reject);

    const output = fs.createWriteStream(toPath);
    archiver.pipe(output)
      .on('close', resolve)
      .on('error', reject);

    archiver.entry(contents, { name: filename, date: new Date() }, (err) => {
      if (err) {
        reject(err);
      } else {
        archiver.finish();
      }
    });
  });
}

function promisify(fn) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      args.push((err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });

      fn(...args);
    });
  }
}
