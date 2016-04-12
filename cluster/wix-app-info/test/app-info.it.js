'use strict';
const expect = require('chai').expect,
  get = require('./test-utils'),
  childTestkit = require('wix-childprocess-testkit');

[{name: 'non-clustered', app: './test/apps/run-node', deathCount: 'N/A', workerCount: 1},
  {name: 'wix-cluster', app: './test/apps/run-cluster', deathCount: 0, workerCount: 2}]
  .forEach(app => {

    describe(`app-info in ${app.name} mode`, () => {

      childTestkit
        .server(app.app, {env: {PORT: 3000, SOME_ENV_VAR: 'some.env.value'}}, childTestkit.checks.httpGet('/'))
        .beforeAndAfter();

      describe('/about', () => {
        it('should serve basic app info as json given Accept header other than "html"', () =>
          get.jsonSuccess('http://localhost:3000/about').then(json => {
            expect(json).to.have.deep.property('name', 'an.app');
            expect(json).to.have.deep.property('version', '1.2.3');
            expect(json).to.contain.keys('name', 'version', 'uptimeOs', 'uptimeApp', 'serverCurrentTime', 'serverTimezone',
              'workerCount', 'memoryRss', 'memoryHeapTotal', 'memoryHeapUsed');
          })
        );

        it('should display cluster stats as json', () =>
          get.jsonSuccess('http://localhost:3000/about').then(json => {
            expect(json).to.have.deep.property('workerDeathCount', app.deathCount);
            expect(json).to.have.deep.property('workerCount', app.workerCount);
            expect(json).to.have.deep.property('memoryRss').be.string('MB');
            expect(json).to.have.deep.property('memoryHeapTotal').be.string('MB');
            expect(json).to.have.deep.property('memoryHeapUsed').be.string('MB');
          })
        );

        it('should display cluster stats as html', () =>
          get.htmlSuccess('http://localhost:3000/about').then(html => {
            expect(html).to.contain('MB');
          })
        );

        it('should serve basic app info as html', () =>
          get.htmlSuccess('http://localhost:3000/about').then(html => {
            expect(html).to.contain('Version');
            expect(html).to.contain('an.app');
            expect(html).to.contain('1.2.3');
          })
        );

        it('should also serve json on "/"', () =>
          get.jsonSuccess('http://localhost:3000/').then(json => expect(json).to.have.deep.property('name', 'an.app'))
        );

        it('should also serve html on "/"', () =>
          get.htmlSuccess('http://localhost:3000/').then(html =>expect(html).to.contain('an.app'))
        );
      });

      describe('/env', () => {
        it('should server environment variables as json given Accept header other than "html"', () =>
          get.jsonSuccess('http://localhost:3000/env').then(json => {
            expect(json).to.have.deep.property('SOME_ENV_VAR', 'some.env.value');
          })
        );

        it('should serve environment variables as html', () =>
          get.htmlSuccess('http://localhost:3000/env').then(html => {
            expect(html).to.contain('SOME_ENV_VAR');
            expect(html).to.contain('some.env.value');
          })
        );
      });
    });
  });