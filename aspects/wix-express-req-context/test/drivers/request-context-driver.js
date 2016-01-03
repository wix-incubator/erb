'use strict';
const request = require('request'),
  expect = require('chai').expect,
  wixExpressDomain = require('wix-express-domain'),
  wixExpressReqContext = require('../../index'),
  testkit = require('wix-http-testkit'),
  reqContext = require('wix-req-context');

exports.assertThat = (property, matcher, onRequestWith, server) => {
  return done => request.get(server.getUrl(property), onRequestWith, (error, response, body) => {
    matcher(body);
    done();
  });
};

exports.isEqualTo = expected => {
  return body => expect(body).to.equal(expected);
};

exports.contain = expected =>{
  return body => expect(body).to.contain(expected);
};

exports.isValidGuid = () => {
  return body => expect(body).to.beValidGuid();
};

exports.aServer = () => {
  const server = testkit.server();
  const app = server.getApp();

  app.use(wixExpressDomain);
  app.use(wixExpressReqContext);
  app.get('/:reqContextPropertyName', (req, res) =>
      res.send(reqContext.get()[req.params.reqContextPropertyName])
  );

  return server;
};

