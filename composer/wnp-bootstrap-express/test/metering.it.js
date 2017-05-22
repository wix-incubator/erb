const expect = require('chai').use(require('sinon-chai')).expect,
  http = require('wnp-http-test-client'),
  testkit = require('./testkit'),
  WixMeasuredFactory = require('wix-measured'),
  CollectingReporter = require('./support/collecting-reporter'),
  eventually = require('wix-eventually');

describe('express metering', function() {
  
  describe('once enabled', () => {
    const {app, reporter} = setup({ENABLE_EXPRESS_METRICS: true});

    it('route reports metrics once enabled', () => {
      return http(app.getUrl('/ok'))
        .then(() => eventually(() => expect(reporter.meters('tag=WEB.type=express.resource=get_ok')).not.to.be.empty));
    });

    it('route reports errors once enabled', () => {
      return http(app.getUrl('/not-ok'))
        .then(() => eventually(() => expect(reporter.meters('tag=WEB.type=express.resource=get_not-ok.error')).not.to.be.empty));
    });
  });
  
  describe('once disabled', () => {
    const {app, reporter} = setup();
    
    it('does not report meters for route', () => {
      return http(app.getUrl('/ok'))
        .then(() => eventually(() => {
          expect(reporter.meters('tag=WEB.resource=get_ok')).to.be.empty
        }));
    });
  });
  
  function setup(env = {}) {
    const reporter = new CollectingReporter();
    const wixMeasuredFactory = new WixMeasuredFactory('localhost', 'wnp-bootstrap-express');
    wixMeasuredFactory.addReporter(reporter);
    const appFn = app => {
      app.get('/ok', (req, res) => res.end());
      app.get('/not-ok', (req, res, next) => next(new Error('woof')));
      return app;
    };

    const {app} = testkit(appFn, {wixMeasuredFactory, env});
    app.beforeAndAfter();    
    return {app, reporter}
  }
});
