'use strict';
const log = require('wnp-debug')('wnp-bootstrap-composer');

module.exports.assembler = () => new ShutdownAssembler();
module.exports.wrapFunction = wrapFunction;
module.exports.wrapHttpServer = wrapHttpServer;

class ShutdownAssembler {
  constructor() {
    this._httpServerShutdownFunctions = [];
    this._shutdownFunctions = [];
  }

  addHttpServer(server, msg) {
    this._httpServerShutdownFunctions.push(wrapHttpServer(server, msg));
    return this;
  }

  addShutdownFn(fn, msg) {
    this._shutdownFunctions.push(wrapFunction(fn, msg));
    return this;
  }

  assemble() {
    return () => Promise.all(this._httpServerShutdownFunctions.map(fn => fn()))
      .then(() => Promise.all(this._shutdownFunctions.map(fn => fn())));
  }
}

function wrapHttpServer(httpServer, name) {
  return () => httpServer.closeAsync()
    .then(() => log.debug(`${name} closed`))
    .catch(e => {
      if (e.message === 'Not running') {
        log.debug(`${name} closed`);
      } else {
        log.error(`Failed closing ${name}`, e);
      }
    });
}

function wrapFunction(fn, name) {
  return () => new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error(`${name} failed closing within 4 seconds`)), 4000).unref();
    Promise.resolve().then(fn).then(resolve).catch(reject);
  })
    .then(() => log.debug(`${name} closed`))
    .catch(e => log.error(`Failed closing ${name}`, e));
}