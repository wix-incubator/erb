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
    this.reqContext = require('../wix-req-context')();
  });

  it("request id", function () {
    var requestId = uuid.generate();
    this.reqContext.setReuqetId(requestId);
    expect(this.reqContext.reuqetId()).to.equal(requestId);
  });
  it("user ip", function () {
    var userIp = '192.1.1.1';
    this.reqContext.setUserIp(userIp);
    expect(this.reqContext.userIp()).to.equal(userIp);
  });
  it("user port", function () {
    var userPort = 1000;
    this.reqContext.setUserPort(userPort);
    expect(this.reqContext.userPort()).to.equal(userPort);
  });
  it("user agent", function () {
    var userAgent = 'chrome';
    this.reqContext.setUserAgent(userAgent);
    expect(this.reqContext.userAgent()).to.equal(userAgent);
  });
  it("geo data", function () {
    var geoData = { geo: 'some-geo'};
    this.reqContext.setGeoData(geoData);
    expect(this.reqContext.geoData()).to.equal(geoData);
  });

});