'use strict';
const expect = require('chai').expect,
  env = require('./support/environment'),
  req = require('./support/req');

//TODO: add versions for http output
//TODO: add versions for custom error handlers
describe('wix bootstrap error handling', function () {
  this.timeout(60000);
  env.start();

  //TODO: figure out best way to count worker shutdown/restart - these should be events on master.
  it('should handle critical(async) exceptions using built-in error handler and restart worker', () =>
    req.get(env.appUrl('/errors/async?m=async')).then(res => {
      expect(res.status).to.equal(500);
      expect(res.json()).to.deep.equal({name: 'Error', message: 'async'});
    })
  );

  it('should handle applicative(sync) exceptions using built-in error handler and keep worker running', () =>
    req.get(env.appUrl('/errors/sync?m=async')).then(res => {
      expect(res.status).to.equal(500);
      expect(res.json()).to.deep.equal({name: 'Error', message: 'async'});
    }));

  it('should handle request timeouts using built-in timeout handler', () =>
    req.get(env.appUrl('/errors/timeout?ms=1500')).then(res => {
      expect(res.status).to.equal(503);
      //TODO: add better assert on content;
      //expect(res.json).to.deep.equal({name: 'Error', message: 'x-timeout'});
    }));

});