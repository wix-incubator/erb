var request = require('request');
var expect = require('chai').expect;
var mock = require('mock-require');
var mockery = require('mockery');
var uuid = require('uuid-support');


describe("wix request context", function () {

  before(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });
  });

  after(function () {
    mockery.disable();
  });

  beforeEach(function(){
    function DomainModule() {}

    DomainModule.prototype.wixDomain = function () {
      if (!this.domain) {
        this.domain = {};
      }
      return this.domain;
    };
    var domain = new DomainModule();
    mockery.registerMock('wix-express-domain', domain);
    this.reqContext = require('../wix-req-context');
  });

  var ctx = {requestId: 'some-id', userIp: '1.1.1.1'};
  var anotherCtx = {requestId: 'some-other-id', userIp: '2.2.2.2'};

  it("set and get request context", function () {
    this.reqContext.setReqContext(ctx);
    expect(this.reqContext.reqContext()).to.equal(ctx);
  });
  it("set more than once the reqContext, should be equal to the first time", function () {
    this.reqContext.setReqContext(ctx);
    this.reqContext.setReqContext(anotherCtx);
    expect(this.reqContext.reqContext()).to.equal(ctx);
  });
  it("change the ref of req context should not change the data", function () {
    this.reqContext.setReqContext(ctx);
    var origId = ctx.requestId;
    ctx.requestId = 'someAnotherRequestId';
    expect(ctx.requestId).to.equal(origId);
  });
});