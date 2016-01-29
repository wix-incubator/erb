'use strict';
const expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  appInfoApp = require('..'),
  moment = require('moment'),
  get = require('./test-utils'),
  exchange = require('wix-cluster-exchange');

describe('app-info', () => {
  const server = aServer({
    appVersion: '1.2.3-SNAPSHOT',
    appName: 'an.app'
  });

  before(() => process.env.SOME_ENV_VAR = 'some.env.value');
  server.beforeAndAfter();

  describe('/about', () => {
    it('should serve basic app info as json given Accept header other than "html"', () =>
      get.jsonSuccess(server.getUrl('about')).then(json => {
        expect(json).to.have.deep.property('name', 'an.app');
        expect(json).to.have.deep.property('version', '1.2.3');
        expect(json).to.contain.keys('name', 'version', 'uptimeOs', 'uptimeApp', 'serverCurrentTime', 'serverTimezone',
          'processCount', 'memoryRss', 'memoryHeapTotal', 'memoryHeapUsed');
      })
    );

    it('should display cluster stats as json', () => {
      const client = exchange.client('cluster-stats');
      client.send({type: 'disconnected', id: 1});
      client.send({type: 'stats', id: 1, stats: {rss: 1, heapTotal: 10, heapUsed: 1024}});

      return get.jsonSuccess(server.getUrl('about')).then(json => {
        expect(json).to.have.deep.property('workerDeathCount', 1);
        expect(json).to.have.deep.property('processCount', 1);
        expect(json).to.have.deep.property('memoryRss', '1 B');
        expect(json).to.have.deep.property('memoryHeapTotal', '10 B');
        expect(json).to.have.deep.property('memoryHeapUsed', '1.02 kB');
      });
    });

    it('should display cluster stats as html', () => {
      const client = exchange.client('cluster-stats');
      client.send({type: 'stats', id: 1, stats: {rss: 1, heapTotal: 10, heapUsed: 1024}});

      return get.htmlSuccess(server.getUrl('about')).then(html => {
        expect(html).to.contain('1 B');
        expect(html).to.contain('10 B');
        expect(html).to.contain('1.02 kB');
      });
    });


    it('should serve basic app info as html', () =>
      get.htmlSuccess(server.getUrl('about')).then(html => {
        expect(html).to.contain('Version');
        expect(html).to.contain('an.app');
        expect(html).to.contain('1.2.3');
      })
    );

    it('should also serve json on "/"', () =>
      get.jsonSuccess(server.getUrl()).then(json => expect(json).to.have.deep.property('name', 'an.app'))
    );

    it('should also serve html on "/"', () =>
      get.htmlSuccess(server.getUrl()).then(html =>expect(html).to.contain('an.app'))
    );
  });

  describe('/app-data', () => {
    it('should serve startup time, version as json given Accept header other than "html"', () =>
      get.jsonSuccess(server.getUrl('app-data')).then(json => {
        expect(json).to.have.deep.property('version', '1.2.3');
        expect(json).to.have.deep.property('serverStartup').that.is.string(moment().utc().format('DD/MM/YYYY HH:'));
      })
    );
  });

  describe('/env', () => {
    it('should server environment variables as json given Accept header other than "html"', () =>
      get.jsonSuccess(server.getUrl('env')).then(json => {
        expect(json).to.have.deep.property('SOME_ENV_VAR', 'some.env.value');
      })
    );

    it('should serve environment variables as html', () =>
      get.htmlSuccess(server.getUrl('env')).then(html => {
        expect(html).to.contain('SOME_ENV_VAR');
        expect(html).to.contain('some.env.value');
      })
    );
  });

  function aServer(opts) {
    const server = testkit.server();
    server.getApp().use(appInfoApp(opts));
    return server;
  }
});