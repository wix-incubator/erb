const expect = require('chai').expect,
  get = require('./test-utils'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch'),
  retry = require('retry-as-promised'),
  path = require('path'),
  shelljs = require('shelljs'),
  decompress = require('decompress'),
  fs = require('fs');

const tmp = path.resolve('./target/it-tmp');

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
  workerCount: 1,
  dumps: ['worker-1.heapsnapshot']
}]
  .forEach(app => {

    describe(`app-info in ${app.name} mode`, function () {
      this.timeout(5000);

      testkit.fork(app.app, { env: { PORT: 3000, SOME_ENV_VAR: 'some.env.value', PROFILING_RESOURCES_DIR: './target/it-tmp' } }, testkit.checks.httpGet('/'))
        .beforeAndAfter();

      describe('/about', () => {
        it('should display basic app info json', () =>
          get.jsonSuccess('http://localhost:3000/about/api').then(json => {
            expect(json).to.have.deep.property('name', 'an.app');
            expect(json).to.have.deep.property('version', '1.2.3');
            expect(json).to.contain.keys('name', 'version', 'uptimeOs', 'uptimeApp', 'serverCurrentTime', 'serverTimezone',
              'workerCount');
          })
        );

        it('should display cluster stats json', () =>
          get.jsonSuccess('http://localhost:3000/about/api').then(json => {
            expect(json).to.have.deep.property('workerDeathCount', app.deathCount);
            expect(json).to.have.deep.property('workerCount', app.workerCount);
          })
        );

        it('should display cluster stats html', () =>
          get.htmlSuccess('http://localhost:3000/about').then(html => {
            expect(html).to.contain('Worker process count');
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
          get.htmlSuccess('http://localhost:3000/').then(html => expect(html).to.contain('an.app'))
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

      describe('profiling', () => {
        beforeEach(() => {
          const directories = [path.join(tmp, 'heapdump'), path.join(tmp, 'profiles'), path.join(tmp, 'extracted-zip'), path.join(tmp, 'downloaded-zip')];
          shelljs.rm('-rf', directories);
          shelljs.mkdir('-p', directories);
        });

        describe('/heap-dump', function () {
          it('should render heap dump json', () => {
            return get.jsonSuccess('http://localhost:3000/heap-dump/api').then(json => {
              expect(json).to.deep.equal({ profiles: [] });
            });
          });

          it('should return 404 for not existing dump id', () => {
            return get.json('http://localhost:3000/heap-dump/api/download/2001-01-10T09:12:13.050Z', 404).then(json => {
              expect(json).to.deep.equal({ message: 'Archive with id [2001-01-10T09:12:13.050Z] not found' });
            });
          });

          it('should generate and then allow to download generated heap dump', () => {
            return issueGenerateHeadDump()
              .then(downloadHeapDumps)
              .then(([dump, response]) => verifyResponseHeaders(dump, response));
          });
        });

        describe('/cpu-profile', () => {
          beforeEach(() => {
            const directories = [path.join(tmp, 'profiles')];
            shelljs.rm('-rf', directories);
            shelljs.mkdir('-p', directories);
          });

          it('should generate cpu dump and return immediately', () => {
            return jsonPost('http://localhost:3000/cpu-profile/api/generate?duration=100', 202)
              .then(cpuProfileGenerated);
          });

          it('should generate and then allow to download generated heap dump', () => {
            return jsonPost('http://localhost:3000/cpu-profile/api/generate?duration=100', 202)
              .then(downloadCPUProfile)
              .then(([profile, response]) => verifyCPUProfileResponseHeaders(profile, response));
          });

          it('should return 404 when profile does not exist', () => {
            return fetch('http://localhost:3000/cpu-profile/api/download/WRONG_ID').then((response) => {
              expect(response.status).to.eq(404)
            })
          });
        });
      });
    });
  });

function issueGenerateHeadDump() {
  return jsonPost('http://localhost:3000/heap-dump/api/generate', 202)
    .then(json => expect(json).to.deep.equal({ message: 'Submitted profiling job', resultUrl: '/heap-dump' }));
}

function downloadHeapDumps() {
  let tempZip = 'target/it-tmp/downloaded-zip/temp.zip';
  return heapDumpGenerated()
    .then(dump =>
      download(`http://localhost:3000/heap-dump/api/download/${dump.id}`, tempZip)
        .then(res => decompress(tempZip, './target/it-tmp/extracted-zip').then(() => [dump, res])))
}

function heapDumpGenerated() {
  return retry(() =>
      get.jsonSuccess('http://localhost:3000/heap-dump/api')
        .then(json => {
          const dump = json.profiles.find(dump => dump.status === 'READY');
          expect(dump).to.be.ok;
          return dump;
        })
    , 3)
}

function downloadCPUProfile() {
  const zipTmp = 'target/it-tmp/downloaded-zip/profile.zip';
  return cpuProfileGenerated()
    .then(profile => {
      return download(`http://localhost:3000/cpu-profile/api/download/${profile.id}`, zipTmp)
        .then(response => decompress(zipTmp, './target/it-tmp/extracted-zip').then(() => [profile, response]))
    })

}

function cpuProfileGenerated() {
  return retry(() => {
    return get.jsonSuccess('http://localhost:3000/cpu-profile/api').then((json) => {
      const profile = json.profiles.find(profile => profile.status === 'READY');
      expect(profile).to.be.ok;
      return profile
    })
  }, { timeout: 1000, max: 3, backoffBase: 1000 })
}

function verifyCPUProfileResponseHeaders(profile, response) {
  expect(response.headers.get('content-type')).to.equal('application/octet-stream');
  expect(response.headers.get('content-disposition')).to.be.string(`attachment; filename=${profile.id}.zip`);
}


function verifyResponseHeaders(dump, res) {
  expect(res.headers.get('content-type')).to.equal('application/octet-stream');
  expect(res.headers.get('content-disposition')).to.eq(`attachment; filename=${dump.id}.zip`)
}


function download(url, tempZip) {
  return fetch(url).then(res => {
    return new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(tempZip);
      res.body.pipe(dest)
        .on('close', () => resolve(res))
        .on('error', e => reject(e));
    });
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
