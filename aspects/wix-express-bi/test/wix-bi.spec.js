'use strict';
const biContext = require('wix-bi'),
  biExpressContxt = require('../wix-express-bi'),
  testkit = require('wix-http-testkit'),
  request = require('request'),
  cookieUtils = require('cookie-utils'),
  expect = require('chai').expect,
  chance = require('chance')(),
  wixExpressDomain = require('wix-express-domain');


describe('wix bi', ()=> {

  const server = aServer();
  server.beforeAndAfterEach();

  const globalSessionId = chance.guid();
  const uidx = chance.guid();
  const cidx = chance.guid();

  const cookies = {
    '_wix_browser_sess': globalSessionId,
    '_wixUIDX': uidx,
    '_wixCIDX': cidx
  };

  it('should return empty bi context when bi cookies not provided', (done)=> {
    request.get(server.getUrl('/bi'), {}, (error, response, body) => {
      expect(JSON.parse(body)).to.deep.equal({});
      done();
    });
  });

  it('should return bi context when bi cookies is provided', (done)=> {
    request.get(server.getUrl('/bi'), {headers: {cookie: cookieUtils.toHeader(cookies)}}, (error, response, body) => {
      expect(JSON.parse(body)).to.deep.equal({
        'globalSessionId': globalSessionId,
        'uidx': uidx,
        'cidx': cidx
      });
      done();
    });
  });


});


function aServer() {
  const server = testkit.server();
  const app = server.getApp();

  app.use(wixExpressDomain);
  app.use(biExpressContxt);
  app.get('/bi', (req, res) =>
      res.send(biContext.get())
  );
  return server;
}

