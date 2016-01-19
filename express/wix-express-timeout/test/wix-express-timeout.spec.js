'use strict';
const expect = require('chai').expect,
  rp = require('request-promise'),
  httpTestkit = require('wix-http-testkit'),
  env = require('env-support').basic(),
  wixExpressTimeout = require('..');

describe('wix express timeout', function () {
  this.timeout(30000);

  anApp().beforeAndAfter();

  it('should allow normal operations', () =>
    aGet('/ok').then(res => expect(res.statusCode).to.equal(200))
  );

  it('should emit x-timeout event on response in case of timeout operation', () =>
    aGet('/slow').then(res => {
      expect(res.statusCode).to.equal(504);
      expect(JSON.parse(res.body)).to.deep.equal({name: 'Error', message: 'request timed out after 10 mSec'});
    })
  );

  it('should not timeout when overriding the timeout and the first times out assuming the second did not time out (allowing to set override timeout for specific operations)', () =>
    aGet('/slower/but-fine').then(response => {
      expect(response.statusCode).to.equal(200);
    })
  );

  it('should timeout if the second middle does timeout in case of timeout override', () =>
    aGet('/slower/not-fine').then(res => {
      expect(res.statusCode).to.be.equal(504);
      expect(JSON.parse(res.body)).to.deep.equal({name: 'Error', message: 'request timed out after 100 mSec'});
    })
  );

  function aGet(path) {
    return rp({
      uri: `http://localhost:${env.PORT}${path}`,
      resolveWithFullResponse: true,
      simple: false
    });
  }

  function anApp() {
    const server = httpTestkit.server({port: env.PORT});
    const app = server.getApp();

    app.use(wixExpressTimeout.get(10));

    app.use((req, res, next) => {
      res.on('x-timeout', err => res.status(504).json({name: err.name, message: err.message}));
      next();
    });

    app.get('/ok', (req, res) => res.send('hi'));
    app.get('/slow', (req, res) => setTimeout(() => res.send('slow'), 10000));

    app.use('/slower/*', wixExpressTimeout.get(100));

    app.get('/slower/but-fine', (req, res) => setTimeout(() => res.send('slower/but-fine'), 20));
    app.get('/slower/not-fine', (req, res) => setTimeout(() => res.send('slower/not-fine'), 2000));

    return server;
  }

});