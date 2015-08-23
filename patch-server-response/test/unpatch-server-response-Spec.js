var request = require('request'),
  expect = require('chai').expect;
var serverResponsePatch = require('../patch-server-response');

var port = 3030;
var server = require('http-test-kit').testApp({port: port});
server.getApp().use(function (req, res, next) {
  res.on("before-writing-headers", function() {
    res.append('before-write-headers', 'triggered');
  });
  next();
});
server.getApp().get('/write', function (req, res) {
  res.write('hi');
  res.end();
});
server.getApp().get('/send', function (req, res) {
  res.send('hi');
});
server.getApp().get('/redirect', function (req, res) {
  res.redirect('/bla');
});



describe("patch-server-response .unpatch()", function () {

  server.beforeAndAfter();

  beforeEach(function() {
    serverResponsePatch.unpatch();
  });

  it("should not emit the before-writing-headers event when using send", function (done) {
    request.get('http://localhost:' + port + '/send', function (error, response, body) {
      expect(response.headers).to.not.have.property('before-write-headers');
      done();
    });
  });

  it("should not emit the before-writing-headers event when using write", function (done) {
    request.get('http://localhost:' + port + '/write', function (error, response, body) {
      expect(response.headers).to.not.have.property('before-write-headers');
      done();
    });
  });

  it("should not emit the before-writing-headers event when using redirect", function (done) {
    request.get('http://localhost:' + port + '/redirect', function (error, response, body) {
      expect(response.headers).to.not.have.property('before-write-headers');
      done();
    });
  });
});





