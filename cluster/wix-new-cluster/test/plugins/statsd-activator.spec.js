'use strict';
const expect = require('chai').use(require('sinon-chai')).expect,
  sinon = require('sinon'),
  WixMeasured = require('wix-measured'),
  EventEmitter = require('events'),
  plugin = require('../../lib/plugins/statsd-activator'),
  Logger = require('wnp-debug').Logger,
  messages = require('../../lib/messages');

describe('statsd-activator', () => {

  it('should activate statsd adapter on activation message from worker', sinon.test(function() {
    const {cluster, connect, metrics, log} = setup(this);

    cluster.emit('message', {}, messages.statsdActivationMessage({host: 'a-host', interval: 20}));

    expect(connect).to.have.been.calledWith(metrics, {host: 'a-host', interval: 20});
    expect(log.debug).to.have.been.calledWith(sinon.match('activated with host: \'a-host\' and interval: \'20\''));
  }));

  it('should activate on first message only', sinon.test(function() {
    const {cluster, connect, log} = setup(this);

    cluster.emit('message', {}, messages.statsdActivationMessage({host: 'a-host', interval: 20}));
    cluster.emit('message', {}, messages.statsdActivationMessage({host: 'a-host', interval: 20}));

    expect(connect).to.have.been.calledOnce;
    expect(log.debug).to.have.been.calledOnce;
  }));

  it('should not activate adapter if message is of stats, but missing part of message', sinon.test(function() {
    const {cluster, connect, log} = setup(this);

    cluster.emit('message', {}, messages.statsdActivationMessage({host: 'a-host'}));

    expect(connect).to.not.have.been.called;
    expect(log.error).to.have.been.calledWith(sinon.match('but configuration is incomplete'));
  }));

  it('should not activate adapter for not matching message', sinon.test(function() {
    const {cluster, connect, log} = setup(this);

    cluster.emit('message', {}, messages.aWixClusterMessageWithKey('not-known'));

    expect(connect).to.not.have.been.called;
    expect(log.debug).to.not.have.been.called;
  }));

  function setup(ctx) {
    const cluster = new EventEmitter();
    const metrics = sinon.createStubInstance(WixMeasured);
    const log = sinon.createStubInstance(Logger);
    const connect = ctx.spy();

    plugin.master(log, metrics, connect)({cluster});

    return {cluster, metrics, connect, log};
  }

});