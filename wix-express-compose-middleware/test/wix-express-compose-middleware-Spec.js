var expect = require('chai').expect;
var compose = require("../wix-express-compose-middleware");

describe("wix express middleware", function () {

  var log = [];

  beforeEach(function () {
    log = [];
  });

  function makeMiddleware(index) {
    return function middleware(req, res, next) {
      log.push("m"+index+"/before");
      next();
      log.push("m"+index+"/after");
    };
  }
  var m1 = makeMiddleware(1);
  var m2 = makeMiddleware(2);
  var m3 = makeMiddleware(3);
  function noop() {}

  it("should support only one middleware", function () {
    var composite = compose(m1);
    composite({}, {}, noop);
    expect(log).to.deep.equal(["m1/before","m1/after"]);
  });

  it("should support two middleware", function () {
    var composite = compose(m1, m2);
    composite({}, {}, noop);
    expect(log).to.deep.equal(["m1/before","m2/before", "m2/after", "m1/after"]);
  });

  it("should support three middleware", function () {
    var composite = compose(m1, m2, m3);
    composite({}, {}, noop);
    expect(log).to.deep.equal(["m1/before","m2/before", "m3/before", "m3/after", "m2/after", "m1/after"]);
  });

});





