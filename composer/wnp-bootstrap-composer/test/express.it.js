const expect = require('chai').expect,
  testkit = require('./support/testkit'),
  fetch = require('node-fetch'),
  reqOptions = require('wix-req-options'),
  statsdTestkit = require('wix-statsd-testkit'),
  eventually = require('wix-eventually');

describe('express', function () {
  this.timeout(10000);

  const statsd = statsdTestkit.server().beforeAndAfter();

  describe('defaults', () => {
    const app = testkit.server('express').beforeAndAfter();

    it('should start app that responds to "/health/is_alive" on app port as per ops contract', () =>
      aGet(app.appUrl('/health/is_alive'))
    );

    it('should disable x-powered-by header by default', () =>
      aGet(app.appUrl('/health/is_alive'))
        .then(res => expect(res.res.headers.get('x-powered-by')).to.equal(null))
    );

    it('should provide access to aspects within express app', () => {
      const opts = reqOptions.builder().options();
      return fetch(app.appUrl('/req-context'), opts).then(res => {
        expect(res.status).to.equal(200);
        return res.json();
      }).then(json => expect(json).to.have.deep.property('requestId', opts.headers['x-wix-request-id']));
    });

    it('should provide access to decoded session within express app', () => {
      const req = reqOptions.builder().withSession();
      return fetch(app.appUrl('/wix-session'), req.options()).then(res => {
        expect(res.status).to.equal(200);
        return res.json();
      }).then(json => expect(json).to.deep.equal(req.wixSession.sessionJson));
    });

    it('should set cache-control headers to no-cache by default', () => {
      return fetch(app.appUrl('/cache-control')).then(res => {
        expect(res.status).to.equal(200);
        expect(res.headers.get('cache-control')).to.equal('no-cache');
      });
    });

    it('should provide access to newrelic within express app', () => {
      return fetch(app.appUrl('/newrelic')).then(res => {
        expect(res.status).to.equal(200);
        return res.json();
      }).then(json => expect(json).to.deep.equal({
        reqTimingHeaders: '',
        appTimingHeaders: ''
      }));
    });
  });

  describe('express 1/2-arg function support', () => {
    let app;
    
    afterEach(() => app.stop());

    it('should support express function with 1 arg (context) but print ugly warning message', () => {
      return startApp('express-app-composer-one-arg')
        .then(() => aGet(app.appUrl('/composer-1-arg')))
        .then(res => expect(res.text).to.equal('wnp-bootstrap-composer'))
        .then(() => expect(app.stdouterr()).to.be.string('express app function with 1 argument (config|context) is deprecated'));
    });

    it('should support express function with 2 args (app, context) where app is injected by composer and not print any warning', () => {
      return startApp('express-app-composer')
        .then(() => aGet(app.appUrl('/composer-2-args')))
        .then(res => expect(res.text).to.equal('wnp-bootstrap-composer'))
        .then(() => expect(app.stdouterr()).to.not.be.string('express app function with 1 argument (config|context) is deprecated'));
    });

    function startApp(name) {
      app = testkit.server(name);
      return app.start();
    }
  });
  
  describe('custom express app', () => {
    const app = testkit.server('express').beforeAndAfter();

    it('should allow to add express app and mount it onto main app port and mount point', () =>
      aGet(app.appUrl('/custom')).then(res => expect(res.text).to.equal('custom'))
    );
  });
  
  describe('metrics', () => {
    const env = {
      ENABLE_EXPRESS_METRICS: true,
      WIX_BOOT_STATSD_INTERVAL: 50
    };
    
    const app = testkit.server('express', env).beforeAndAfter();

    it('reported for user app routes with tag=WEB', () => {
      return aGet(app.appUrl('/custom'))
        .then(() => eventually(() => {
          expect(statsd.events('tag=WEB.type=express.resource=get_custom')).not.to.be.empty;
        }));
    });

    it('reported for is_alive route on main port with tag=INFRA', () => {
      return aGet(app.appUrl('/health/is_alive'))
        .then(() => eventually(() => {
          expect(statsd.events('tag=INFRA.type=express.resource=get_health_is_alive')).not.to.be.empty;
        }));
    });

    it.skip('reported for is_alive_detailed route on management port with tag=INFRA', () => {
      return aGet(app.managementAppUrl('/health/is_alive_detailed'))
        .then(() => eventually(() => {
          expect(statsd.events('tag=INFRA.type=express.resource=get_health_is_alive_detailed')).not.to.be.empty;
        }));
    });

    it.skip('reported for sync-specs route on management port with tag=INFRA', () => {
      return aPost(app.managementAppUrl('/sync-specs'))
        .then(() => eventually(() => {
          console.log(statsd.events());
          expect(statsd.events('tag=INFRA.type=express.resource=post_sync-specs')).not.to.be.empty;
        }));
    });
  });
  
  describe('options', () => {
    const app = testkit.server('express-options').beforeAndAfter();

    it('should pass-over express options from bootstrap to express composer', () =>
      fetch(app.appUrl('/duration/1000'))
        .then(res => expect(res.status).to.equal(504))
    );
  });
  
  function aPost(url) {
    return fetch(url, {method: 'POST'})
      .then(res => {
        expect(res.status).to.equal(200);
        return res.text().then(text => {
          return {res, text};
        });
      })
  }

  function aGet(url) {
    return fetch(url)
      .then(res => {
        expect(res.status).to.equal(200);
        return res.text().then(text => {
          return {res, text};
        });
      })
  }
});
