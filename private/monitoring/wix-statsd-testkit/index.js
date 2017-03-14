const TestkitBase = require('wix-testkit-base').TestkitBase,
  dgram = require('dgram'),
  defaultPort = require('wix-test-ports').STATSD;

module.exports.server = opts => new WixStatsdTestkit(opts);

class WixStatsdTestkit extends TestkitBase {
  constructor(opts) {
    super();
    this._port = opts && opts.port || defaultPort;
    this._events = [];
  }

  doStart() {
    return Promise.resolve().then(() => {
      this._server = dgram.createSocket('udp4');
      this._server.on('message', msg => {
        const message = msg.toString();
        if (message.indexOf('|g') === msg.length - 2) {
          const trimmed = message.split('|g')[0].split(':');

          this._events.push({
            key: trimmed[0],
            value: Number(trimmed[1])
          });
        }
      });
      this._server.bind(this._port, err => err ? Promise.reject(err) : Promise.resolve());
    });
  }

  doStop() {
    return new Promise((resolve, reject) => {
      this.clear();
      this._server.close(err => {
        return err ? reject(err) : resolve();
      });
    });
  }

  get port() {
    return this._port;
  }

  events(fragment) {
    if (fragment) {
      return this._events.filter(evt => evt.key.indexOf(fragment) > -1);

    } else {
      return this._events;
    }
  }

  clear() {
    this._events = [];
  }
}
