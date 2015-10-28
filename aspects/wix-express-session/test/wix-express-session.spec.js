'use strict';
var Chance = require('chance');
var chance = new Chance();

describe('server', function () {

  var port = 3333;

  var server = require('http-testkit').testApp({port: port});
  var request = require('request');
  var expect = require('chai').expect;
  var builders = require('./builders');
  var wixSession = require('wix-session')({mainKey: builders.key()});
  var wixDomain = require('wix-express-domain');
  var cookiesUtils = require('cookies-utils');
  var url = require('url');


// naming convention - service should be a singleton in a real app
  var requireLoginService = require('../wix-express-session')(wixSession);

  function invalidSessionHandler(req, res) {
    res.send('from-callback');
  }

  server.getApp().use(wixDomain.wixDomainMiddleware());
  server.getApp().use('/requireLogin', requireLoginService.requireLogin());
  server.getApp().use('/requireLoginCallback', requireLoginService.requireLoginWithCallback(invalidSessionHandler));
  server.getApp().use('/requireLoginRedirect', requireLoginService.requireLoginWithRedirect());

  server.getApp().get('/requireLogin', function (req, res) {
    res.send(requireLoginService.wixSession().userGuid);
  });

  server.getApp().get('/notRequireLogin', function (req, res) {
    res.send('no need to login');
  });

  server.getApp().get('/requireLoginRedirect', function (req, res) {
    res.send('protected with require login');
  });

  var baseUrl = 'http://localhost:' + port;

  describe('Session support middleware', function () {

    server.beforeAndAfterEach();

    it('not require login should get 200', function (done) {
      request.get(baseUrl + '/notRequireLogin', function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        // validate no need to login
        done();
      });
    });

    it('require login without wixSession should be rejected', function (done) {
      request.get(baseUrl + '/requireLogin', function (error, response, body) {
        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('require login with custom callback without wixSession should be rejected', function (done) {
      request.get(baseUrl + '/requireLoginCallback', function (error, response, body) {
        expect(response.body).to.equal('from-callback');
        done();
      });
    });

    it('require login with redirect should redirect if no session', function (done) {
      var options = {
        uri: baseUrl + '/requireLoginRedirect?someParam=123',
        followRedirect: false
      };

      request.get(options, function (error, response) {
        expect(response.statusCode).to.equal(302);
        var parsedUrl = url.parse(response.headers.location);
        expect(parsedUrl.host).to.equal('www.wix.com');
        expect(parsedUrl.protocol).to.equal('https:');
        expect(parsedUrl.pathname).to.equal('/signin');
        expect(parsedUrl.query).to.equal('postLogin=' + encodeURIComponent(options.uri));

        done();
      });
    });


    it('require login with a session should be accepted', function (done) {
      var session = sessionBuilder();
      var cookie = cookiesUtils.toHeader({wixSession: wixSession.sessionToToken(session)});
      var options = {
        uri: baseUrl + '/requireLogin',
        method: 'GET',
        headers: {
          Cookie: cookie
        }
      };
      request.get(options, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(body).to.equal(session.userGuid);
        done();
      });
    });

  });
});

var sessionBuilder = function () {
  return {
    uid: chance.integer(),
    permissions: randomString(),
    userGuid: chance.guid(),
    userName: randomString(),
    email: randomString() + '@somedomain.com',
    mailStatus: randomString(),
    userAgent: randomString(),
    isWixStaff: chance.bool(),
    isRemembered: chance.bool(),
    expiration: chance.date(),
    userCreationDate: chance.date(),
    version: 1,
    colors: {}
  };

};

var randomString = function () {
  return chance.string().replace('#', '');
};