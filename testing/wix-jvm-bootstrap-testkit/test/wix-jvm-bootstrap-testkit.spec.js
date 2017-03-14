const bootstrapTestkit = require('..'),
  fetch = require('node-fetch'),
  expect = require('chai').use(require('chai-as-promised')).expect,
  _ = require('lodash'),
  shelljs = require('shelljs'),
  path = require('path'),
  defaultPort = require('wix-test-ports').JVM_BOOTSTRAP;

describe('wix-jvm-bootstrap-testkit', function () {
  this.timeout(1200000);//ci takes long time to fetch java deps, as these are node build machines

  before(done => {
    try {
      shelljs.pushd(path.join(__dirname, 'server'));
      let output = shelljs.exec('mvn install -q -B');
      if (output.code !== 0) {
        done(Error('mvn install failed with exit code' + output.code));
      } else {
        done();
      }
    } finally {
      shelljs.popd();
    }
  });

  describe('defaults', () => {
    const server = aServer();

    before(() => server.doStart());
    after(() => server.doStop());

    it('should use default port if not provided and reflect it in getPort(), getUrl()', () => {
      expect(server.getPort()).to.equal(defaultPort);
      expect(server.getUrl()).to.equal(`http://localhost:${defaultPort}`);

      return expectA200Ok(server);
    });

    after(() => expectAConnRefused(server));
  });

  describe('start-up check', () => {
    const server = aServer();

    it('should fail to start if another http server is listening on same port', () =>
      server.doStart().then(() => expect(server.doStart()).to.be.rejected));

    after(() => server.doStop());
    after(() => expectAConnRefused(server));
  });

  //TODO: figure out a way to test it properly
  // describe('custom timeout', () => {
  //   const server = aServer({ timeout: 1 });
  //
  //   it('fail to start due to timeout', () =>
  //     expect(server.doStart()).to.be.rejected
  //   );
  //
  //   after(done => {
  //     console.log('waiting for jvm to die');
  //     setTimeout(() => done(), 10000);
  //   });
  // });

  describe('extends wix-testkit-base', () => {
    const server = aServer().beforeAndAfter();

    it('should be started around test', () =>
      expectA200Ok(server)
    );
  });

  describe('custom config', () => {
    const server = aServer({config: './test/configs/test-server-config.xml'}).beforeAndAfter();

    it('copy over custom config for a bootstrap-based app', () =>
      fetch(server.getUrl('/config')).then(res => {
        expect(res.status).to.equal(200);
        return res.text();
      }).then(txt => expect(txt).to.equal('wohoo-node'))
    );
  });

  describe('custom port', () => {
    aServer({port: 3311}).beforeAndAfter();

    it('should use custom port if provided', () =>
      fetch('http://localhost:3311')
        .then(res => expect(res.status).to.equal(200))
    );
  });


  function expectA200Ok(server) {
    return fetch(server.getUrl())
      .then(res => expect(res.status).to.equal(200));
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
