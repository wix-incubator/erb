'use strict';
const bootstrapTestkit = require('..'),
  fetch = require('node-fetch'),
  chai = require('chai'),
  expect = chai.expect,
  shelljs = require('shelljs'),
  path = require('path'),
  _ = require('lodash');

chai.use(require('chai-as-promised'));

describe('wix-jvm-bootstrap-testkit', function () {
  this.timeout(600000);//ci takes long time to fetch java deps, as these are node build machines

  //before(done => {
  //  try {
  //    shelljs.pushd(path.join(__dirname, 'server'));
  //    let output = shelljs.exec('mvn install');
  //    if (output.code !== 0) {
  //      done(Error('mvn install failed with exit code' + output.code));
  //    } else {
  //      done();
  //    }
  //  } finally {
  //    shelljs.popd();
  //  }
  //});

  describe('defaults', () => {
    const server = aServer();

    before(() => server.doStart());
    after(() => server.doStop());

    it('should use port 3334 by default if not provided and reflect it in getPort(), getUrl()', () => {
      expect(server.getPort()).to.equal(3334);
      expect(server.getUrl()).to.equal('http://localhost:3334');

      return expectA200Ok(server);
    });

    after(() => expectAConnRefused(server));
  });

  describe('start-up check', () => {
    const server = aServer();

    it('should fail to start if http server is listening on same port', () =>
      server.doStart().then(() => expect(server.doStart()).to.be.rejected));

    after(() => server.doStop());
    after(() => expectAConnRefused(server));
  });


  describe('custom timeout', () => {
    const server = aServer({ timeout: 1 });

    it('fail to start due to timeout', () =>
      expect(server.doStart())
        .to.be.rejectedWith('Program exited during startup')
    );

    after(done => {
      console.log('waiting for jvm to die');
      setTimeout(() => done(), 2000);
    });
  });

  describe('extends wix-testkit-base', () => {
    const server = aServer().beforeAndAfter();

    it('should be started around test', () =>
      expectA200Ok(server)
    );
  });

  describe('custom config', () => {
    const server = aServer({ config: './test/configs/test-server-config.xml'}).beforeAndAfter();

    it('copy over custom config for a bootstrap-based app', () =>
      fetch(server.getUrl('/config')).then(res => {
        expect(res.status).to.equal(200);
        return res.text();
      }).then(txt => expect(txt).to.equal('wohoo-node'))
    );
  });

  function expectA200Ok(server) {
    return fetch(server.getUrl()).then(res => expect(res.status).to.equal(200));
  }

  function expectAConnRefused(server) {
    return expect(fetch(server.getUrl())).to.be.rejected;
  }

  function aServer(options) {
    const opts = _.merge({}, {
      artifact: {
        groupId: 'com.wixpress.test',
        artifactId: 'test-server',
        version: '1.0.0-SNAPSHOT'
      }
    }, options || {});

    return bootstrapTestkit.server(opts);
  }
});