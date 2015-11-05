'use strict';
const express = require('express'),
  _ = require('lodash'),
  resolve = require('url').resolve;

const defaultOptions = {
  port: 3333
};

module.exports = options => {
  return new HttpServer(options);
};

class HttpServer {
  constructor(options) {
    this.options = _.merge(defaultOptions, options);
    this.app = express();
  }

  listen(cb) {
    this.server = this.app.listen(this.getPort(), cb);
  }

  close(cb) {
    this.server.close(cb);
  }

  beforeAndAfterEach() {
    beforeEach(done => this.listen(done));
    afterEach(done => this.close(done));
  }

  beforeAndAfter() {
    before(done => this.listen(done));
    after(done => this.close(done));
  }

  getApp() {
    return this.app;
  }

  getUrl(path) {
    let url = `http://localhost:${this.getPort()}`;
    if (path) {
      url = resolve(url, path);
    }
    return url;
  }

  getPort() {
    return this.options.port;
  }
}