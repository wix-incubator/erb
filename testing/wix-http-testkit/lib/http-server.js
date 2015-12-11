'use strict';
const express = require('express'),
  _ = require('lodash'),
  resolve = require('url').resolve;

module.exports = options => new HttpServer(options);

class HttpServer {
  constructor(options) {
    this.options = options || {};
    this.port = this.options.port || _.random(3000, 4000);
    this.app = express();
  }

  start(done) {
    const cb = done || _.noop;
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.getPort(), err => {
        if (err) {
          reject(err);
          cb(err);
        } else {
          resolve();
          cb();
        }
      });
    });
  }

  stop(done) {
    const cb = done || _.noop;
    return new Promise((resolve, reject) => {
      this.server.close(err => {
        if (err) {
          reject(err);
          cb(err);
        } else {
          resolve();
          cb();
        }
      });
    });
  }

  beforeAndAfterEach() {
    beforeEach(() => this.start());
    afterEach(() => this.stop());
  }

  beforeAndAfter() {
    before(() => this.start());
    after(() => this.stop());
  }

  getApp() {
    return this.app;
  }

  getUrl(path) {
    let url = `http://localhost:${this.getPort()}`;
    return path ? resolve(url, path) : url;
  }

  getPort() {
    return this.port;
  }
}