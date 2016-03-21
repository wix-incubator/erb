'use strict';
const express = require('express'),
  _ = require('lodash'),
  resolve = require('url').resolve,
  TestkitBase = require('wix-testkit-base').TestkitBase;

module.exports = options => new WixHttpTestkit(options);

class WixHttpTestkit extends TestkitBase {
  constructor(options) {
    super();
    this.options = options || {};
    this.port = this.options.port || _.random(3000, 4000);
    this.app = express();
  }

  doStart() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.getPort(), err => {
        return err ? reject(err) : resolve();
      });
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
    let url = `http://localhost:${this.getPort()}`;
    return path ? resolve(url, path) : url;
  }

  getPort() {
    return this.port;
  }
}