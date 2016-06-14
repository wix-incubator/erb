'use strict';
const views = require('./commons'),
  Router = require('express').Router,
  heapDumper = require('../heap-dumper'),
  ZipStream = require('zip-stream'),
  fs = require('fs'),
  clusterClient = require('wix-cluster-client'),
  log = require('wnp-debug')('app-info'),
  path = require('path'),
  moment = require('moment');

class HeapDumpView extends views.AppInfoView {
  constructor(opts) {
    super(opts);
    this._clusterClient = clusterClient();
    this._clusterClient.on('generate-heapdump', data => {
      heapDumper
        .generate(path.join(data.folder, `/worker-${this._clusterClient.workerId}.heapsnapshot`))
        .catch(e => log.error(`Failed generating heap dump in ${data.folder} with error: `, e));
    });
    this._heapDumpsFolder = opts.tmpFolder + '/heapdump';
  }

  _data() {
    return heapDumper.getSnapshots(this._heapDumpsFolder)
      .then(dumps => dumps.map(dump => {
        return {
          downloadUri: `heap-dump/api/download/${dump.snapshotFolder}`,
          date: dump.date,
          status: dump.status
        }
      }));
  }

  api() {
    const router = new Router();
    router.get('/', (req, res, next) => {
      this._data()
        .then(dumps => res.json({dumps}))
        .catch(next);
    });

    router.get('/download/:id', (req, res, next) => {
      function addToZip(archiver, files, res, next) {
        const file = files.pop();
        archiver.entry(fs.createReadStream(file.path), {name: file.id, date: new Date()}, err => {
          if (err) {
            next(err);
          }
          if (files.length === 0) {
            archiver.finish();
          } else {
            addToZip(archiver, files, res, next);
          }
        });
      }

      const filePaths = heapDumper.getSnapshotFilePaths(this._heapDumpsFolder, req.params.id);

      if (filePaths.length === 0) {
        res.status(404).json({message: `Archive with id [${req.params.id}] not found`});
      } else {
        const archiver = new ZipStream();
        res.set({
          'Content-type': 'application/octet-stream',
          'Content-disposition': `attachment; filename=${req.params.id}.zip`
        });
        archiver.pipe(res);
        addToZip(archiver, filePaths, res, next);
      }
    });

    router.post('/generate', (req, res) => {
      try {
        const folder = heapDumper.prepare({
          tempDir: this._heapDumpsFolder,
          date: new Date(),
          count: this._clusterClient.workerCount
        });
        this._clusterClient.emit('generate-heapdump', {folder});
        res.status(202).json({message: 'Submitted heap dump job', resultUrl: '/heap-dump'});
      } catch (e) {
        log.error('Failed generating heap dump: ', e);
        log.error(e);
        res.status(500).json(e);
      }
    });
    return router;
  }

  view() {
    return this._data()
      .then(dumps => dumps.map(dump => {
        dump.timeago = moment(dump.date).fromNow(true);
        dump.date = dump.date.toISOString();
        dump.downloadable = dump.status === 'READY';
        dump.style = dump.status.toLocaleLowerCase();
        return dump;
      }))
      .then(items => ({items: items}))
  }
}

module.exports = (tmpFolder) => new HeapDumpView({
  mountPath: '/heap-dump',
  title: 'Heap dump',
  template: 'heap-dump',
  tmpFolder: tmpFolder
});