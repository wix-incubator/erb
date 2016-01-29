'use strict';
const views = require('./commons'),
  os = require('os'),
  moment = require('moment'),
  dateFormat = require('dateformat'),
  prettyBytes = require('pretty-bytes'),
  cluster = require('cluster'),
  exchange = require('wix-cluster-exchange');

class AboutView extends views.AppInfoView {
  constructor(opts) {
    super(opts);
    this.appName = opts.appName;
    this.appVersion = opts.appVersion;
    this.statsCollector = new StatsCollector(exchange.server('cluster-stats'), cluster);
  }

  api() {
    const memStats = this.statsCollector.memory;

    return Promise.resolve({
      name: this.appName,
      version: this.appVersion,
      versionNode: process.version,
      uptimeOs: moment.duration(os.uptime(), 'seconds').humanize(),
      uptimeApp: moment.duration(process.uptime(), 'seconds').humanize(),
      serverCurrentTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      serverTimezone: dateFormat(Date.now(), 'Z'),
      processCount: this.statsCollector.processCount,
      workerDeathCount: this.statsCollector.workerDieCount,
      memoryRss: prettyBytes(memStats.rss),
      memoryHeapTotal: prettyBytes(memStats.heapTotal),
      memoryHeapUsed: prettyBytes(memStats.heapUsed)
    });
  }

  view() {
    return this.api().then(res => {
      return {
        left: [
          views.item('Name', res.name),
          views.item('Version', res.version),
          views.item('Node version', res.versionNode),
          views.item('Uptime (os)', res.uptimeOs),
          views.item('Uptime (app)', res.uptimeApp),
          views.item('Server current time', res.serverCurrentTime),
          views.item('Server Timezone', res.serverTimezone)
        ],
        right: [
          views.item('Process count (master + workers)', res.processCount),
          views.item('Worker process death count', res.workerDeathCount),
          views.item('Memory usage (rss)', res.memoryRss),
          views.item('Memory usage (heapTotal)', res.memoryHeapTotal),
          views.item('Memory usage (heapUsed)', res.memoryHeapUsed)
        ]
      };
    });
  }
}

class StatsCollector {
  constructor(statsExchangeServer, cluster) {
    this.cluster = cluster;
    this.dieCount = 0;
    this.memStats = new Map();

    statsExchangeServer.onMessage(msg => {
      if (msg.type === 'disconnected') {
        this.dieCount += 1;
        this.memStats.delete(msg.id);
      } else if (msg.type === 'stats') {
        this.memStats.set(msg.id, msg.stats);
      }
    });
  }

  get processCount() {
    return Object.keys(this.cluster.workers).length + 1;
  }

  get workerDieCount() {
    return this.dieCount;
  }

  get memory() {
    let res = {rss: 0, heapTotal: 0, heapUsed: 0};
    this.memStats.forEach(mem => {
      res.rss += mem.rss;
      res.heapTotal += mem.heapTotal;
      res.heapUsed += mem.heapUsed;
    });
    return res;
  }
}

module.exports = (appName, appVersion) => new AboutView({
  appName: appName,
  appVersion: appVersion,
  mountPath: '/about',
  title: 'Info',
  template: 'two-columns'
});

module.exports.statsCollector = (exchangeServer, cluster) => new StatsCollector(exchangeServer, cluster);