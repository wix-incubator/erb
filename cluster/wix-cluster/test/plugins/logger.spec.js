'use strict';
const expect = require('chai').expect,
  plugin = require('../../lib/plugins/logger'),
  mocks = require('../support/mocks'),
  testkit = require('wix-stdouterr-testkit'),
  log = require('wnp-debug')('for-tests');

describe('logger plugin', () => {
  const logTestkit = testkit.interceptor().beforeAndAfterEach();

  [{evt: 'fork', msg: 'Worker with id: 1 forked.'},
    {evt: 'online', msg: 'Worker with id: 1 is online'},
    {evt: 'listening', msg: 'Worker with id: 1 is listening'},
    {evt: 'disconnect', msg: 'Worker with id: 1 disconnect'},
    {evt: 'exit', msg: 'Worker with id: 1 exited'}]
    .forEach(el => {

      it(`should log ${el.evt} events`, () => {
        const cluster = mocks.cluster();
        plugin.master({log})(cluster);

        cluster.emit(el.evt, {id: 1});

        expect(logTestkit.stderr).to.be.string(el.msg);
      });
    });
});