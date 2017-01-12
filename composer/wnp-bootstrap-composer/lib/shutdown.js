const assert = require('assert'),
  Promise = require('bluebird');

class ShutdownAssembler {
  constructor(log, closeTimeout = 10000) {
    this._log = log;
    const fnWrapper = functionWrapper(log);
    this._wrapFunction = (name, fn) => fnWrapper(name, withTimeout(fn, closeTimeout));
    this._httpServerShutdownFunctions = [];
    this._shutdownFunctions = [];
  }

  addHttpServer(name, httpServer) {
    assert(name, 'name is mandatory');
    assert(typeof name === 'string', 'name must be a string');
    assert(httpServer, 'httpServer is mandatory');
    assert(httpServer.closeAsync, 'httpServer must be async http server');

    const closeable = this._wrapFunction(name, httpServerToCloseable(httpServer));
    this._httpServerShutdownFunctions.push(closeable);
    return this;
  }

  addFunction(name, fn) {
    assert(name, 'name is mandatory');
    assert(typeof name === 'string', 'name must be a string');
    assert(fn, 'fn is mandatory');
    assert(typeof fn === 'function', 'fn must be a function');

    const closeable = this._wrapFunction(name, fn);
    this._shutdownFunctions.push(closeable);
    return this;
  }

  emit() {
    const closeHttpServers = () => Promise.all(this._httpServerShutdownFunctions.map(fn => fn()));
    const closeFunctions = () => Promise.all(this._shutdownFunctions.map(fn => fn()));
    return () => closeHttpServers().then(() => closeFunctions())
      .catch(e => this._log.error('Failed closing with ', e));
  }
}

function withTimeout(fn, timeout) {
  return () => Promise.resolve().then(fn).timeout(timeout, `close timeout of ${timeout}ms exceeded - terminated`);
}

function functionWrapper(log) {
  return (name, fn) => {
    return () => Promise.resolve().then(fn)
      .then(() => log.debug(`${name} closed`))
      .catch(e => log.error(`Failed closing ${name}`, e));
  };
}

function httpServerToCloseable(httpServer) {
  return () => httpServer.closeAsync();
}

module.exports.Assembler = ShutdownAssembler;
module.exports.functionWrapper = functionWrapper;
module.exports.httpServerToCloseable = httpServerToCloseable;
