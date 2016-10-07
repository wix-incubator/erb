'use strict';
const expect = require('chai').expect,
  get = require('./test-utils'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch'),
  retry = require('retry-as-promised'),
  request = require('request'),
  path = require('path'),
  shelljs = require('shelljs'),
  decompress = require('decompress'),
  fs = require('fs');

[{
  name: 'non-clustered',
  app: './test/apps/run-node',
  deathCount: 'N/A',
  workerCount: 1,
  dumps: ['worker-1.heapsnapshot']
}, {
  name: 'wix-cluster',
  app: './test/apps/run-cluster',
  deathCount: 0,
  workerCount: 2,
  dumps: ['worker-1.heapsnapshot', 'worker-2.heapsnapshot']
}]
  .forEach(app => {

    describe(`app-info in ${app.name} mode`, function () {
      this.timeout(5000);

      testkit.fork(app.app, {env: {PORT: 3000, SOME_ENV_VAR: 'some.env.value'}}, testkit.checks.httpGet('/'))
        .beforeAndAfter();

      describe('/about', () => {
        it('should display basic app info json', () =>
          get.jsonSuccess('http://localhost:3000/about/api').then(json => {
            expect(json).to.have.deep.property('name', 'an.app');
            expect(json).to.have.deep.property('version', '1.2.3');
            expect(json).to.contain.keys('name', 'version', 'uptimeOs', 'uptimeApp', 'serverCurrentTime', 'serverTimezone',
              'workerCount', 'memoryRss', 'memoryHeapTotal', 'memoryHeapUsed');
          })
        );

        it('should display cluster stats json', () =>
          get.jsonSuccess('http://localhost:3000/about/api').then(json => {
            expect(json).to.have.deep.property('workerDeathCount', app.deathCount);
            expect(json).to.have.deep.property('workerCount', app.workerCount);
            expect(json).to.have.deep.property('memoryRss').be.string('MB');
            expect(json).to.have.deep.property('memoryHeapTotal').be.string('MB');
            expect(json).to.have.deep.property('memoryHeapUsed').be.string('MB');
          })
        );

        it('should display cluster stats html', () =>
          get.htmlSuccess('http://localhost:3000/about').then(html => {
            expect(html).to.contain('MB');
          })
        );

        it('should serve basic app info html', () =>
          get.htmlSuccess('http://localhost:3000/about').then(html => {
            expect(html).to.contain('Version');
            expect(html).to.contain('an.app');
            expect(html).to.contain('1.2.3');
          })
        );

        it('should also serve html on "/"', () =>
          get.htmlSuccess('http://localhost:3000/').then(html =>expect(html).to.contain('an.app'))
        );
      });

      describe('/env', () => {
        it('should server environment variables json', () =>
          get.jsonSuccess('http://localhost:3000/env/api').then(json => {
            expect(json).to.have.deep.property('SOME_ENV_VAR', 'some.env.value');
          })
        );

        it('should serve environment variables html', () =>
          get.htmlSuccess('http://localhost:3000/env').then(html => {
            expect(html).to.contain('SOME_ENV_VAR');
            expect(html).to.contain('some.env.value');
          })
        );
      });

      describe('/heap-dump', function () {
        const tmp = path.resolve('./target/heap-dump-it');

        beforeEach(() => {
          shelljs.rm('-rf', tmp);
          shelljs.mkdir('-p', path.join(tmp, 'extracted-zip'));
          shelljs.mkdir('-p', path.join(tmp, 'downloaded-zip'));
        });

        it('should render heap dump json', () => {
          return get.jsonSuccess('http://localhost:3000/heap-dump/api').then(json => {
            expect(json).to.deep.equal({dumps: []});
          });
        });

        it('should return 404 for not existing dump id', () => {
          return get.json('http://localhost:3000/heap-dump/api/download/2001-01-10T09:12:13.050Z', 404).then(json => {
            expect(json).to.deep.equal({message: 'Archive with id [2001-01-10T09:12:13.050Z] not found'});
          });
        });

        it('should generate and then allow to download generated heap dump', () => {
          return issueGenerateHeadDump()
            .then(() => downloadHeapDumps())
            .then(response => verifyResponseHeaders(response))
            .then(() => verifyHeapDumpFiles(app.dumps));
        });

      });
    });
  });

function verifyHeapDumpFiles(expectedFiles) {
  expect(shelljs.ls('./target/heap-dump-it/extracted-zip')).to.have.lengthOf(1);
  const dir = path.join('./target/heap-dump-it/extracted-zip', shelljs.ls('./target/heap-dump-it/extracted-zip').pop());
  expect(shelljs.test('-d', dir)).to.equal(true);

  const extractedFiles = shelljs.ls('-A', dir);
  expect(extractedFiles.length).to.equal(expectedFiles.length);
  expectedFiles.forEach(file => expect(extractedFiles).to.include(file));
}

function issueGenerateHeadDump() {
  return jsonPost('http://localhost:3000/heap-dump/api/generate', 202)
    .then(json => expect(json).to.deep.equal({message: 'Submitted heap dump job', resultUrl: '/heap-dump'}));
}

function downloadHeapDumps() {
  let tempZip;
  return retry(() =>
      get.jsonSuccess('http://localhost:3000/heap-dump/api')
        .then(json => {
          const dump = json.dumps.find(dump => dump.status === 'READY');
          expect(dump).to.be.ok;
          return dump.downloadUri;
        })
    , 3)
    .then(path => {
      tempZip = 'target/heap-dump-it/downloaded-zip/temp.zip';
      return download(`http://localhost:3000/${path}`, tempZip)
    })
    .then(res => decompress(tempZip, './target/heap-dump-it/extracted-zip').then(() => res))
}

function verifyResponseHeaders(res) {
  const now = new Date().toISOString().substring(0, 13);
  expect(res.headers['content-type']).to.equal('application/octet-stream');
  expect(res.headers['content-disposition'])
    .to.be.string(`attachment; filename=${now}`)
    .and.to.be.string('.zip');
}


function download(url, tempZip) {
  return new Promise((resolve, reject) => {
    let response;
    request(url)
      .on('response', res => response = res)
      .pipe(fs.createWriteStream(tempZip))
      .on('close', () => resolve(response))
      .on('error', e => reject(e))
  });
}

function jsonPost(url, expectedStatus) {
  return fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    }
  }).then(res => {
    expect(res.status).to.equal(expectedStatus);
    return res.json();
  })
}
