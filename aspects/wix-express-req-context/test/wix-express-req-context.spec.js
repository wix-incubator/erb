'use strict';
const expect = require('chai').expect,
  reqContextMiddleware = require('../lib/wix-express-req-context'),
  intercept = require('intercept-stdout');

describe('req context middleware', () => {
  let out, detach;

  beforeEach(() => {
    out = '';
    detach = intercept(line => {
      out += line;
    });
  });

  afterEach(() => detach);

  it('should set info from request', done => {
    const reqContextMock = reqContext();
    reqContextMiddleware.get(reqContextMock, {})(reqStub(), resStub(), () => {
      expect(reqContextMock.get().requestId).to.be.defined;
      done();
    });
  });

  it('should replace request on subsequent invocations and log error', done => {
    const reqContextMock = reqContext();
    reqContextMiddleware.get(reqContextMock, {})(reqStub(), resStub(), () => {
      reqContextMiddleware.get(reqContextMock, {})(reqStub('567'), resStub(), () => {
        expect(reqContextMock.get().requestId).to.equal('567');
        expect(out).to.be.string('Request context was already populated with: ');
        done();
      });
    });
  });
});

function reqContext(content) {
  let curr = content || {};
  return {
    get: () => { return curr; },
    set: obj => curr = obj,
    content: curr
  };
}

function reqStub(id) {
  return {
    headers: {'x-wix-request-id': id || '123'},
    header: () => {},
    query: {},
    get: () => '',
    connection: {}
  };
}

function resStub() {
  return {
    on: () => {}
  };
}