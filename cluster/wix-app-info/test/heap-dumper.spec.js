'use strict';
const heapDumper = require('../lib/heap-dumper'),
  shelljs = require('shelljs'),
  expect = require('chai').use(require('chai-as-promised')).expect,
  path = require('path'),
  fs = require('fs');

describe('heap dumper', () => {
  const tmp = path.resolve('./target/heap-dumper-unit');

  beforeEach(() => {
    shelljs.rm('-rf', tmp);
    shelljs.mkdir('-p', tmp);
  });

  describe('prepare', () => {

    it('should create new snapshot folder for snapshot files', () => {
      const now = new Date(2000, 12, 10, 11, 12, 13, 50);

      const snapshotFolder = heapDumper.prepare({tempDir: tmp, date: now, count: 1});

      expect(folderExists(snapshotFolder)).to.equal(true);
      expect(snapshotFolder).to.equal(`${tmp}/2001-01-10T09:12:13.050Z`);
      expect(readJson(snapshotFolder, '.meta.json')).to.be.deep.equal({expectedSnapshotCount: 1})
    });

    it('should fail given snapshot folder already exists', () => {
      const now = aDate();
      givenSnapshotFolderFor(now);

      expect(() => heapDumper.prepare({tempDir: tmp, date: now, count: 1}))
        .to.throw(`Directory ${tmp}/${now.toISOString()} already exists`);
    });
  });

  describe('getSnapshots', () => {

    it('should return a list with generated snapshot in reversed order by folder name', () => {
      const forSnapshotReady1 = aDate();
      const snapshotReady1Folder = givenSnapshotFolderWith(forSnapshotReady1, [metaJsonFile(1), snapshotFile(1)]);
      const forSnapshotReady2 = aDate(500);
      const snapshotReady2Folder = givenSnapshotFolderWith(forSnapshotReady2, [metaJsonFile(1), snapshotFile(1)]);

      return heapDumper.getSnapshots(tmp).then(res => {
        expect(res).to.deep.equal([
          {
            date: forSnapshotReady1,
            snapshotFolder: snapshotReady1Folder,
            status: 'READY'
          },
          {
            date: forSnapshotReady2,
            snapshotFolder: snapshotReady2Folder,
            status: 'READY'
          }]);
      });
    });

    it('should return a list with generated snapshot', () => {
      const now = aDate();
      const snapshotFolder = givenSnapshotFolderWith(now, [metaJsonFile(1), snapshotFile(1)]);

      return heapDumper.getSnapshots(tmp).then(res => {
        expect(res).to.deep.equal([{
          date: now,
          snapshotFolder: snapshotFolder,
          status: 'READY'
        }]);
      });
    });

    it('should omit folders with invalid name format', () => {
      givenFolder('not-a-snapshot-folder');

      return heapDumper.getSnapshots(tmp)
        .then(res => expect(res.length).to.equal(0));
    });

    it('should set status IN-PROGRESS for snapshot folders with less snapshot files than defined in .meta.json', () => {
      const date = aDate();
      const snaphsotFolder = givenSnapshotFolderWith(date, [metaJsonFile(2), snapshotFile(1)]);

      return heapDumper.getSnapshots(tmp).then(res => {
        expect(res).to.deep.equal([
          {
            date: date,
            snapshotFolder: snaphsotFolder,
            status: 'IN-PROGRESS'
          }
        ]);
      });
    });

    it('should filter out folders without .meta.json', () => {
      const date = aDate();
      givenSnapshotFolderWith(date, [snapshotFile(1)]);

      return heapDumper.getSnapshots(tmp).then(res => {
        expect(res.length).to.be.equal(0)
      });
    });

    it('should set status as FAILED for snapshot folders without snapshot that are older than 1 minute', () => {
      const olderThanAMinute = aDate(70 * 1000);
      const folder = givenSnapshotFolderWith(olderThanAMinute, [metaJsonFile(2), snapshotFile(1)]);

      return heapDumper.getSnapshots(tmp).then(res => {
        expect(res).to.deep.equal([
          {
            date: olderThanAMinute,
            snapshotFolder: folder,
            status: 'FAILED'
          }
        ]);
      });
    });
  });

  describe('getSnapshotFilePaths', () => {

    it('should return empty list', () =>
      expect(heapDumper.getSnapshotFilePaths(tmp, '2001-01-10T09:12:13.050Z').length).to.be.equal(0)
    );

    it('should fail given invalid id', () => {
      expect(() => heapDumper.getSnapshotFilePaths(tmp, 'any'))
        .to.throw('Invalid id [any]')
    });

    it('should return snapshot paths', () => {
      const now = new Date(2000, 12, 10, 11, 12, 13, 50);
      const folder = givenSnapshotFolderFor(now);
      givenSnapshotIn(folder, 'heap-1.heapsnapshot');
      givenSnapshotIn(folder, 'heap-2.heapsnapshot');

      const filePaths = [
        {id: '2001-01-10T09:12:13.050Z/heap-1.heapsnapshot', path: `${tmp}/2001-01-10T09:12:13.050Z/heap-1.heapsnapshot`},
        {id: '2001-01-10T09:12:13.050Z/heap-2.heapsnapshot', path: `${tmp}/2001-01-10T09:12:13.050Z/heap-2.heapsnapshot`}
      ];

      return expect(heapDumper.getSnapshotFilePaths(tmp, folder)).to.be.deep.equal(filePaths);
    });

  });

  describe('generate', () => {

    it('should generate heap dump and return path to generated file', () =>
      heapDumper.generate(tmp + '/heap.heapsnapshot')
        .then(file => expect(shelljs.test('-f', file)).to.equal(true))
    );

    it('should fail generate heap dump in not existing folder', () =>
      expect(heapDumper.generate('./does-not-exist/heap.heapsnapshot'))
        .to.eventually.be.rejectedWith(Error, 'Dump was not created in ./does-not-exist/heap.heapsnapshot')
    );
  });

  function metaJsonFile(count) {
    return {
      name: '.meta.json',
      content: JSON.stringify({expectedSnapshotCount: count})
    }
  }

  function snapshotFile(id) {
    return {
      name: `heap-${id}.heapsnapshot`,
      content: 'whatever'
    }

  }

  function givenSnapshotFolderWith(date, files) {
    const folder = givenSnapshotFolderFor(date);
    files.forEach(file => fs.writeFileSync(path.join(tmp, folder, file.name), file.content));
    return folder;
  }

  function aDate(backMs) {
    return new Date(Date.now() - (backMs || 0))
  }

  function givenSnapshotFolderFor(date) {
    const dateStr = date.toISOString();
    givenFolder(dateStr);
    return dateStr;
  }

  function givenFolder(name) {
    const dir = `${tmp}/${name}`;
    shelljs.mkdir('-p', dir);
    return dir;
  }

  function givenSnapshotIn(dir, fileName) {
    const file = `${tmp}/${dir}/${fileName || 'heap-1.heapsnapshot'}`;
    shelljs.touch(file);
    return file;
  }

  function folderExists(dir) {
    return shelljs.test('-d', dir);
  }

  function readJson(dir, name) {
    return JSON.parse(shelljs.cat(`${dir}/${name}`))
  }
});

