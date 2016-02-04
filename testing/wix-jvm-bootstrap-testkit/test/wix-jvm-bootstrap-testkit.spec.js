'use strict';
const bootstrapTestkit = require('..'),
  request = require('request'),
  expect = require('chai').expect,
  shelljs = require('shelljs'),
  path = require('path');

describe('wix-jvm-bootstrap-testkit', function () {
  this.timeout(600000);//ci takes long time to fetch java deps, as these are node build machines

  //before(done => {
  //  try {
  //    shelljs.pushd(path.join(__dirname, 'server'));
  //    let output = shelljs.exec('mvn install -DskipTests');
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

    it('should use port 3334 by default if not provided and reflect it in getPort(), getUrl()', done => {
      expect(server.getPort()).to.equal(3334);
      expect(server.getUrl()).to.equal('http://localhost:3334');

      expectA200Ok(server, done);
    });
  });

  describe('extends wix-testkit-base', () => {
    const server = aServer().beforeAndAfter();

    it('should be started around test', done => {
      expectA200Ok(server, done);
    });
  });

  describe('custom config', () => {
    const server = aServer('./test/configs/test-server-config.xml').beforeAndAfter();

    it('copy over custom config for a bootstrap-based app', done => {
      request.get(server.getUrl('/config'), (error, response, body) => {
        expect(response.statusCode).to.equal(200);
        expect(body).to.equal('wohoo-node');
        done();
      });
    });
  });

  function expectA200Ok(server, cb) {
    request.get(server.getUrl(), (error, response, body) => {
      expect(response.statusCode).to.equal(200);
      expect(body).to.equal('hello');
      cb();
    });
  }

  function aServer(config) {
    let server = bootstrapTestkit.server({
      artifact: {
        groupId: 'com.wixpress.test',
        artifactId: 'test-server',
        version: '1.0.0-SNAPSHOT'
      },
      port: bootstrapTestkit.defaultPort,
      config: config
    });
    return server;
  }
});