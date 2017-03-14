const expect = require('chai').use(require('chai-as-promised')).expect,
  testkit = require('..'),
  dgram = require('dgram'),
  eventually = require('wix-eventually').with({timeout: 2000}),
  defaultPort = require('wix-test-ports').STATSD;

describe('wix-statsd-testkit', function () {
  this.timeout(4000);

  describe('default port', () => {
    const server = testkit.server().beforeAndAfter();

    it('should use default port', () => {
      expect(server.port).to.equal(8125).to.equal(defaultPort);
      return assertListening(server);
    });
  });

  describe('api', () => {
    const server = testkit.server().beforeAndAfterEach();

    it('should allow to access received messages', () => {
      return Promise.resolve()
        .then(() => client(server).send('gauge=aGauge', 12))
        .then(() => eventually(() => expect(server.events('aGauge').pop()).to.deep.equal({
          key: 'gauge=aGauge',
          value: 12
        })));
    });

    it('should allow to clear collected messages', () => {
      return Promise.resolve()
        .then(() => client(server).send('gauge=aGauge', 12))
        .then(() => eventually(() => expect(server.events().length).to.equal(1)))
        .then(() => server.clear())
        .then(() => expect(server.events().length).to.equal(0));
    });
  });

  describe('stop', () => {
    const server = testkit.server();
    beforeEach(() => server.start());

    it('should stop server and clean messages', () => {
      return client(server).send('gauge=aGauge', 12)
        .then(() => eventually(() => expect(server.events().length).to.equal(1)))
        .then(() => server.stop())
        .then(() => expect(server.events().length).to.equal(0))
        .then(() => assertNotListening(server));
    });
  });

  describe('should start/stop', () => {
    const server = testkit.server();

    before(() => server.start());
    after(() => server.stop());

    it('should be started', () => assertListening(server));

    after(() => assertNotListening(server));
  });

  function assertListening(server) {
    return client(server).send('gauge=aGauge', 123)
      .then(() => eventually(() => expect(server.events('aGauge').pop()).to.deep.equal({
        key: 'gauge=aGauge',
        value: 123
      })));
  }

  function assertNotListening(server) {
    return client(server).send('gauge=aGauge', 123)
      .then(() => expect(eventually(() => expect(server.events('aGauge').pop()).to.not.be.undefined)).to.eventually.be.rejectedWith('Timeout'));
  }

  function client(server) {
    const sendMessage = (key, value) => {
      return new Promise((resolve, reject) => {
        const client = dgram.createSocket('udp4');
        const message = `${key}:${value}|g`;
        client.send(message, 0, message.length, server.port, 'localhost', function (err) {
          if (err) {
            reject(err);
          }
          client.close();
          resolve();
        });
      });
    };

    return {
      send: sendMessage
    };
  }

});
