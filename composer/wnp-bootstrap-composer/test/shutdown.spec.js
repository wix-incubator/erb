const shutdown = require('../lib/shutdown'),
  expect = require('chai').use(require('chai-as-promised')).use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  Logger = require('wnp-debug').Logger,
  HttpServer = require('http').Server,
  bluebird = require('bluebird');

require('sinon-as-promised');

describe('shutdown', function () {

  describe('httpServerToCloseable', () => {

    it('should return a promisified function that closes http server and resolves', sinon.test(function (done) {
      const httpServer = asyncHttpServer();
      const close = shutdown.httpServerToCloseable(httpServer);

      close().then(() => {
        expect(httpServer.close).to.have.been.calledOnce;
        done();
      });
    }));

    it('should return a promisified function that closes http server and rejects in case of failure', sinon.test(function (done) {
      const httpServer = asyncHttpServer(new Error('failed'));
      const close = shutdown.httpServerToCloseable(httpServer);

      close().catch(e => {
        expect(httpServer.close).to.have.been.calledOnce;
        expect(e).to.be.instanceOf(Error);
        done();
      });
    }));
  });

  describe('wrapFunction', () => {

    it('should wrap and non-thenable sync function that does not throw upon invocation', sinon.test(function () {
      const log = sinon.createStubInstance(Logger);
      const wrapFunction = shutdown.functionWrapper(log);
      const fn = this.stub().returns(1);

      const close = wrapFunction('aFunction', fn);

      return close().then(() => {
        expect(fn).to.have.been.calledOnce;
        expect(log.debug).to.have.been.calledWith('aFunction closed').calledOnce;
      });
    }));

    it('should wrap and non-thenable sync function that throws error upon invocation', sinon.test(function () {
      const log = sinon.createStubInstance(Logger);
      const wrapFunction = shutdown.functionWrapper(log);
      const fn = this.stub().throws(new Error('failed'));

      const close = wrapFunction('aFunction', fn);

      return close().then(() => {
        expect(fn).to.have.been.calledOnce;
        expect(log.error).to.have.been.calledWith('Failed closing aFunction').calledOnce;
      });
    }));

    it('should wrap a promise that resolves upon invocation', sinon.test(function () {
      const log = sinon.createStubInstance(Logger);
      const wrapFunction = shutdown.functionWrapper(log);
      const fn = this.stub().resolves();

      const close = wrapFunction('aFunction', fn);

      return close().then(() => {
        expect(fn).to.have.been.calledOnce;
        expect(log.debug).to.have.been.calledWith('aFunction closed').calledOnce;
      });
    }));

    it('should wrap a promise that rejects upon invocation', sinon.test(function () {
      const log = sinon.createStubInstance(Logger);
      const wrapFunction = shutdown.functionWrapper(log);
      const fn = this.stub().rejects(new Error('failed'));

      const close = wrapFunction('aFunction', fn);

      return close().then(() => {
        expect(fn).to.have.been.calledOnce;
        expect(log.error).to.have.been.calledWith('Failed closing aFunction').calledOnce;
      });
    }));

  });

  describe('Assembler', () => {

    it('should validate addHttpServer input', () => {
      const {assembler} = anAssembler();

      expect(() => assembler.addHttpServer()).to.throw('name is mandatory');
      expect(() => assembler.addHttpServer({})).to.throw('name must be a string');
      expect(() => assembler.addHttpServer('name')).to.throw('httpServer is mandatory');
      expect(() => assembler.addHttpServer('name', {})).to.throw('httpServer must be async http server');
    });

    it('should validate addFunction input', () => {
      const {assembler} = anAssembler();

      expect(() => assembler.addFunction()).to.throw('name is mandatory');
      expect(() => assembler.addFunction({})).to.throw('name must be a string');
      expect(() => assembler.addFunction('name')).to.throw('fn is mandatory');
      expect(() => assembler.addFunction('name', {})).to.throw('fn must be a function');
    });

    it('should resolve with no registered shutdowns', () => {
      return anAssembler().assembler.emit()();
    });

    it('should assemble and close http servers and functions', sinon.test(function () {
      const {assembler, log} = anAssembler();
      const httpServer = asyncHttpServer();
      const fn = closeableFn(this);

      const close = assembler
        .addHttpServer('server', httpServer)
        .addFunction('fn', fn)
        .emit();

      return close().then(() => {
        expect(httpServer.close).to.have.been.calledOnce;
        expect(fn).to.have.been.calledOnce;
        expect(log.debug).to.have.been.calledWith(sinon.match('closed')).calledTwice;
      });
    }));

    it('should close http servers before other functions', sinon.test(function () {
      const {assembler} = anAssembler();
      const httpServer = asyncHttpServer();
      const fn = closeableFn(this);

      const close = assembler
        .addHttpServer('server', httpServer)
        .addFunction('fn', fn)
        .emit();

      return close().then(() => {
        expect(httpServer.close).to.have.been.calledBefore(fn);
      });
    }));

    it('should execute close function even if http server close failed', sinon.test(function () {
      const {assembler} = anAssembler();
      const httpServer = asyncHttpServer(new Error('failed'));
      const fn = closeableFn(this);

      const close = assembler
        .addHttpServer('server', httpServer)
        .addFunction('fn', fn)
        .emit();

      return close().then(() => {
        expect(httpServer.close).to.have.been.calledOnce;
        expect(fn).to.have.been.calledOnce;
      });
    }));

    it('should execute all functions even if one of them fails', sinon.test(function () {
      const {assembler} = anAssembler();
      const fnThatFails = closeableFn(this);
      const fnThatDoesNotFail = closeableFn(this);

      const close = assembler
        .addFunction('fn', fnThatFails)
        .addFunction('fn', fnThatDoesNotFail)
        .emit();

      return close().then(() => {
        expect(fnThatDoesNotFail).to.have.been.calledOnce;
      });
    }));

    it('should respect provided timeout and terminate close', sinon.test(function () {
      const {assembler, log} = anAssembler(1000);
      const fnThatTakesTooLong = () => bluebird.delay(10000);

      const close = assembler
        .addFunction('fn', fnThatTakesTooLong)
        .emit();

      return close().then(() => {
        expect(log.error).to.have.been.calledWith(
          sinon.match.any,
          sinon.match.has('message', 'close timeout of 1000ms exceeded - terminated'));
      });
    }));
    
    it('should close functions on http server shutdown timeout', () => {
      const {assembler, log} = anAssembler(1000);
      const httpServerThatTakesTooLong = { closeAsync: () => bluebird.delay(10000)};
      const fnThatTakesTooLong = sinon.stub().returns('ok');

      const close = assembler
        .addHttpServer('http', httpServerThatTakesTooLong)
        .addFunction('fn', fnThatTakesTooLong)
        .emit();

      return close().then(() => {
        expect(log.error).to.have.been.calledOnce;
        expect(log.error).to.have.been.calledWith(
          sinon.match.any,
          sinon.match.has('message', 'close timeout of 1000ms exceeded - terminated'));
        expect(fnThatTakesTooLong).to.have.been.calledOnce;
      });

    });

    function anAssembler(closeTimeout = 10000) {
      const log = sinon.createStubInstance(Logger);
      const assembler = new shutdown.Assembler(log, closeTimeout);
      return {log, assembler};
    }

  });

  function asyncHttpServer(closeCallbackArg) {
    const httpServer = sinon.createStubInstance(HttpServer);
    httpServer.close.callsArgWith(0, closeCallbackArg);
    bluebird.promisifyAll(httpServer);

    return httpServer;
  }

  function closeableFn(ctx, error) {
    if (error) {
      return ctx.stub().rejects(error);
    } else {
      return ctx.stub().resolves();
    }
  }

});
