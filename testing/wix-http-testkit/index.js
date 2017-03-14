const express = require('express'),
  resolve = require('url').resolve,
  TestkitBase = require('wix-testkit-base').TestkitBase,
  pem = require('pem'),
  http = require('http'),
  https = require('https'),
  defaultPort = require('wix-test-ports').HTTP;

exports.server = options => new WixHttpTestkit(options);

class WixHttpTestkit extends TestkitBase {
  constructor(options) {
    super();
    this.options = Object.assign({port: defaultPort, ssl: false}, options);
    this.port = this.options.port || defaultPort;
    this.app = express().disable('x-powered-by');
    this.ssl = this.options.ssl;
  }

  doStart() {
    return this._createServer()
      .then(server => {
        this.server = server;
        this.server.listen(this.getPort(), err => err ? Promise.reject(err) : Promise.resolve());
      });
  }

  doStop() {
    return new Promise((resolve, reject) => {
      this.server.close(err => {
        return err ? reject(err) : resolve();
      });
    });
  }

  getApp() {
    return this.app;
  }

  getUrl(path) {
    const scheme = this.ssl ? 'https://' : 'http://';
    let url = `${scheme}localhost:${this.getPort()}`;
    return path ? resolve(url, path) : url;
  }

  getPort() {
    return this.port;
  }

  _createServer() {
    const app = this.app;
    return new Promise((resolve, reject) => {
      if (this.ssl) {
        pem.createCertificate({
          days: 1,
          selfSigned: true
        }, (err, keys) => {
          if (err) {
            reject(err);
          }
          resolve(https.createServer({
            key: keys.serviceKey,
            cert: keys.certificate
          }, app));
        });
      } else {
        resolve(http.createServer(app));
      }
    });
  }

}
