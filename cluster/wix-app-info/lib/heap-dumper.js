'use strict';
const heapdump = require('heapdump'),
  shelljs = require('shelljs'),
  path = require('path'),
  fs = require('fs'),
  assert = require('assert');

module.exports.generate = toFile => (

  new Promise((resolve, reject) => {
    heapdump.writeSnapshot(toFile, (err, filename) => {
      if (!fileExists(filename)) {
        reject(new Error('Dump was not created in ' + filename));
      } else if (err) {
        reject(err); // TODO: not tested path
      } else {
        resolve(filename);
      }
    });
  })
);

module.exports.prepare = opts => {
  const dir = path.join(opts.tempDir, opts.date.toISOString());
  if (dirExists(dir)) {
    throw new Error(`Directory ${dir} already exists`);
  }
  //TODO: don't do mkdirp? assert in app-info
  shelljs.mkdir('-p', dir);
  fs.writeFileSync(path.join(dir, '.meta.json'), JSON.stringify({expectedSnapshotCount: opts.count}));
  return dir;
};

module.exports.getSnapshots = tmpFolder => {
  //TODO: move date to .meta.json instead of folder format
  function excludeWithInvalidFolderFormat(folders) {
    return folders.filter(isValidFolderFormat)
  }

  function excludeWithoutMetaJson(tmpFolder) {
    return folders => folders.filter(folder => shelljs.test('-f', path.join(tmpFolder, folder, '.meta.json')))
  }

  function getStatus(files, date, expectedSnapshotCount) {
    if (files.length === expectedSnapshotCount) {
      return 'READY';
    } else {
      return (Date.now() - date.getTime()) < 60000 ? 'IN-PROGRESS' : 'FAILED';
    }
  }

  return Promise.resolve(shelljs.ls(tmpFolder))
    .then(excludeWithoutMetaJson(tmpFolder))
    .then(excludeWithInvalidFolderFormat)
    .then(folders => folders.reverse())
    .then(sortedFolders => sortedFolders.map(folder => {
      const absolute = path.join(tmpFolder, folder);
      const files = shelljs.ls('-l', absolute).map(el => el.name);
      const date = new Date(folder);
      const expectedSnapshotCount = JSON.parse(shelljs.cat(path.join(absolute, '.meta.json'))).expectedSnapshotCount;

      return {
        date: date,
        snapshotFolder: folder,
        status: getStatus(files, date, expectedSnapshotCount)
      }
    }))
};

module.exports.getSnapshotFilePaths = (baseFolder, id) => {
  assert(isValidFolderFormat(id), `Invalid id [${id}]`);

  return shelljs.ls(path.join(baseFolder, id)).map(file => {
    return {
      id: path.join(id, file),
      path: path.join(baseFolder, id, file)
    }
  });
};

function fileExists(file) {
  return shelljs.test('-f', file);
}

function dirExists(dir) {
  return shelljs.test('-d', dir)
}

function isValidFolderFormat(folder) {
  return !isNaN(Date.parse(folder));
}