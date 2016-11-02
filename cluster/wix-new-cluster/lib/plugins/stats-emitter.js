'use strict';
const measured = require('measured'),
  StatsReporter = require('../stats/statsd-reporter'),
  eventLoop = require('../stats/event-loop'),
  messages = require('../registry/messages');

module.exports.onMaster = (cluster, context) => {
  const reporter = new StatsReporter().start();
  const forked = new measured.Meter({rateUnit: 60000});
  const killed = new measured.Meter({rateUnit: 60000});
  const active = new measured.Gauge(() => Object.keys(cluster.workers).length);
  const deathRow = new measured.Gauge(() => context.deathRow.count);

  const memoryRss = new measured.Gauge(() => (process.memoryUsage().rss / 1048576));
  const memoryHeapTotal = new measured.Gauge(() => (process.memoryUsage().heapTotal / 1048576));
  const memoryHeapUsed = new measured.Gauge(() => (process.memoryUsage().heapUsed / 1048576));
  const eLoop = new measured.Histogram();

  cluster.on('fork', () => forked.mark());
  cluster.on('exit', () => killed.mark());
  eventLoop(ns => eLoop.update(ns));

  reporter.addGauge(active, {tag: 'cluster', stat: 'worker-count', gauge: 'count'});
  reporter.addGauge(deathRow, {tag: 'cluster', stat: 'death-row', gauge: 'count'});
  reporter.addGauge(memoryRss, {tag: 'cluster', stat: 'memory', gauge: 'rss-mb'});
  reporter.addGauge(memoryHeapTotal, {tag: 'cluster', stat: 'memory', gauge: 'heap-total-mb'});
  reporter.addGauge(memoryHeapUsed, {tag: 'cluster', stat: 'memory', gauge: 'heap-used-mb'});
  reporter.addOneMinuteRate(forked, {tag: 'cluster', stat: 'forked'});
  reporter.addOneMinuteRate(killed, {tag: 'cluster', stat: 'killed'});
  reporter.addHist(eLoop, {tag: 'cluster', stat: 'event-loop'});
};

module.exports.onWorker = (cluster, process) => {
  const reporter = new StatsReporter().start();

  const memoryRss = new measured.Gauge(() => (process.memoryUsage().rss / 1048576));
  const memoryHeapTotal = new measured.Gauge(() => (process.memoryUsage().heapTotal / 1048576));
  const memoryHeapUsed = new measured.Gauge(() => (process.memoryUsage().heapUsed / 1048576));
  const eLoop = new measured.Histogram();
  eventLoop(ns => eLoop.update(ns));

  reporter.addGauge(memoryRss, {tag: 'worker', stat: 'memory', gauge: 'rss-mb'});
  reporter.addGauge(memoryHeapTotal, {tag: 'worker', stat: 'memory', gauge: 'heap-total-mb'});
  reporter.addGauge(memoryHeapUsed, {tag: 'worker', stat: 'memory', gauge: 'heap-used-mb'});
  reporter.addHist(eLoop, {tag: 'worker', stat: 'event-loop'});

  process.on('message', msg => {
    if (messages.isYouCanDieNow(msg)) {
      reporter.stop();
    }
  });
};