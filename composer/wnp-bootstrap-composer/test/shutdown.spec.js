'use strict';
const shutdown = require('../lib/shutdown'),
  http = require('http'),
  bluebird = require('bluebird'),
  fetch = require('node-fetch'),
  expect = require('chai').use(require('chai-as-promised')).expect,
  stdOutErrTestkit = require('wix-stdouterr-testkit');

bluebird.promisifyAll(http);

describe('shutdown', function() {
  this.timeout(6000);
  const stdOutErr = stdOutErrTestkit.interceptor().beforeAndAfterEach();

  describe('wrapHttpServer', () => {
    let server;

    beforeEach(() => server && server.closeAsync().catch(() => {
    }));

    it('should close http server and log provided message', () => {
      server = http.createServer((req, res) => res.end());
      const closeServerFn = shutdown.wrapHttpServer(server, 'httpServer');
      return server.listenAsync(3000)
        .then(() => fetch('http://localhost:3000'))
        .then(() => expect(closeServerFn()).to.eventually.be.fulfilled)
        .then(() => expect(fetch('http://localhost:3000')).to.eventually.be.rejected)
        .then(() => expect(stdOutErr.output).to.be.string('httpServer closed'));
    });

    it('should log provided message even if server was not started', () => {
      server = http.createServer((req, res) => res.end());
      const closeServerFn = shutdown.wrapHttpServer(server, 'httpServer');
      return expect(fetch('http://localhost:3000')).to.eventually.be.rejected
        .then(() => expect(closeServerFn()).to.eventually.be.fulfilled)
        .then(() => expect(stdOutErr.output).to.be.string('httpServer closed'));
    });
  });

  describe('wrapFunction', () => {

    it('should wrap a non-thenable function into promise and log message', () => {
      const fn = () => console.log('close message');
      const wrapped = shutdown.wrapFunction(fn, 'aFunction');

      return expect(wrapped()).to.eventually.be.fulfilled
        .then(() => expect(stdOutErr.output).to.be.string('aFunction closed'))
        .then(() => expect(stdOutErr.output).to.be.string('close message'));
    });

    it('should wrap a thenable function into promise and log message', () => {
      const fn = () => Promise.resolve().then(() => console.log('close message'));
      const wrapped = shutdown.wrapFunction(fn, 'aFunction');

      return expect(wrapped()).to.eventually.be.fulfilled
        .then(() => expect(stdOutErr.output).to.be.string('aFunction closed'))
        .then(() => expect(stdOutErr.output).to.be.string('close message'));
    });

    it('should resolve to successful promise even if wrapped function fails', () => {
      const fn = () => Promise.resolve().then(() => Promise.reject(new Error('failed')));
      const wrapped = shutdown.wrapFunction(fn, 'aFunction');

      return expect(wrapped()).to.eventually.be.fulfilled
        .then(() => expect(stdOutErr.output).to.be.string('Failed closing aFunction'));
    });

    it('should terminate function that takes longer than 4s to close, return resolved promise and log error', () => {
      const fn = () => new Promise(() => {});
      const wrapped = shutdown.wrapFunction(fn, 'aFunction');

      return expect(wrapped()).to.eventually.be.fulfilled
        .then(() => expect(stdOutErr.output).to.be.string('aFunction failed closing within 4 seconds'));
    });
  });

  describe('shutdown assembler', () => {

    it('should assemble and execute all shutdown functions', () => {
      const httpServer1 = http.createServer((req, res) => res.end());
      const httpServer2 = http.createServer((req, res) => res.end());

      const assembler = shutdown.assembler();
      const closeFn = assembler
        .addHttpServer(httpServer1, '#1 server')
        .addHttpServer(httpServer2, '#2 server')
        .addShutdownFn(() => console.log('close #1'), '#1 fn')
        .addShutdownFn(() => console.log('close #2'), '#2 fn')
        .assemble();

      return closeFn().then(() => {
        expect(stdOutErr.output).to.be.string('#1 server closed');
        expect(stdOutErr.output).to.be.string('#2 server closed');
        expect(stdOutErr.output).to.be.string('#1 fn closed');
        expect(stdOutErr.output).to.be.string('#2 fn closed');
      });
    });

    it('should close http servers before other functions', () => {
      const closeSeq = [];
      const httpServer1 = {
        closeAsync: () => new Promise(resolve => setTimeout(() => {
          closeSeq.push('server');
          resolve();
        }, 500))
      };

      const assembler = shutdown.assembler();
      const closeFn = assembler
        .addShutdownFn(() => closeSeq.push('fn 1'), '#1 fn')
        .addHttpServer(httpServer1, '#1 server')
        .assemble();

      return closeFn().then(() => expect(closeSeq).to.deep.equal(['server', 'fn 1']));
    });

    it('should execute all function even if one of them fails', () => {
      const httpServer1 = http.createServer((req, res) => res.end());
      const httpServer2 = http.createServer((req, res) => res.end());

      const assembler = shutdown.assembler();
      const closeFn = assembler
        .addHttpServer(httpServer1, '#1 server')
        .addHttpServer(httpServer2, '#2 server')
        .addShutdownFn(() => Promise.reject(new Error('woops')), '#1 fn')
        .addShutdownFn(() => console.log('close #2'), '#2 fn')
        .assemble();

      return closeFn().then(() => {
        expect(stdOutErr.output).to.be.string('#1 server closed');
        expect(stdOutErr.output).to.be.string('#2 server closed');
        expect(stdOutErr.output).to.be.string('Failed closing #1 fn');
        expect(stdOutErr.output).to.be.string('#2 fn closed');
      });
    });


  });

});
