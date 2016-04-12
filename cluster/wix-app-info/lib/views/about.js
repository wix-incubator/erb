'use strict';
const views = require('./commons'),
  os = require('os'),
  moment = require('moment'),
  dateFormat = require('dateformat'),
  prettyBytes = require('pretty-bytes'),
  wixClusterCient = require('wix-cluster-client');

class AboutView extends views.AppInfoView {
  constructor(opts) {
    super(opts);
    this.clusterClient = wixClusterCient();
    this.appName = opts.appName;
    this.appVersion = opts.appVersion;
  }

  api() {
    return Promise.resolve({
      name: this.appName,
      version: this.appVersion,
      versionNode: process.version,
      uptimeOs: moment.duration(os.uptime(), 'seconds').humanize(),
      uptimeApp: moment.duration(process.uptime(), 'seconds').humanize(),
      serverCurrentTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      serverTimezone: dateFormat(Date.now(), 'Z'),
      workerCount: this.clusterClient.workerCount,
      workerDeathCount: this.clusterClient.deathCount,
      memoryRss: prettyBytes(this.clusterClient.stats.rss),
      memoryHeapTotal: prettyBytes(this.clusterClient.stats.heapTotal),
      memoryHeapUsed: prettyBytes(this.clusterClient.stats.heapUsed)
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
          views.item('Worker process count', res.workerCount),
          views.item('Worker process death count', res.workerDeathCount),
          views.item('Memory usage (rss)', res.memoryRss),
          views.item('Memory usage (heapTotal)', res.memoryHeapTotal),
          views.item('Memory usage (heapUsed)', res.memoryHeapUsed)
        ]
      };
    });
  }
}

module.exports = (appName, appVersion) => new AboutView({
  appName: appName,
  appVersion: appVersion,
  mountPath: '/about',
  title: 'Info',
  template: 'two-columns'
});