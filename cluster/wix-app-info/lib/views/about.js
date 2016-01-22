'use strict';
const _ = require('lodash'),
  views = require('./commons'),
  os = require('os'),
  moment = require('moment'),
  dateFormat = require('dateformat'),
  prettyBytes = require('pretty-bytes'),
  cluster = require('cluster'),
  usage = require('usage');

class AboutView extends views.AppInfoView {
  constructor(opts) {
    super(opts);
    this.appName = opts.appName;
    this.appVersion = opts.appVersion;
  }

  api() {
    return Promise.all([this._loadSyncData(), this._getMemUsage()])
      .then(results => {
        const res = {};
        results.forEach(item => _.merge(res, item));
        return res;
      });
  }

  view() {
    return Promise.all([this._loadSyncData(), this._getMemUsage()])
      .then(results => {
        const res = {};
        results.forEach(item => _.merge(res, item));
        return res;
      })
      .then(res => {
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
            views.item('Memory usage (memory)', res.memory),
            views.item('Memory usage (rss)', res.memoryRss),
            views.item('Memory usage (vsize)', res.memoryVSize)
          ]
        };
      });
  }

  _getMemUsage() {
    const empty = () => {
      return {memory: 0, memoryInfo: {rss: 0, vsize: 0}};
    };

    const lookup = pid => new Promise((resolve, reject) => usage.lookup(pid, (err, res) => {
      return resolve(res || empty());
    }));

    const lookups = [lookup(process.pid)];

    for (let id in cluster.workers) {
      lookups.push(lookup(cluster.workers[id].process.pid));
    }

    return Promise.all(lookups).then(results => {
      const aggregate = empty();
      results.forEach(item => {
        aggregate.memory += item.memory;
        aggregate.memoryInfo.rss += item.memoryInfo.rss;
        aggregate.memoryInfo.vsize += item.memoryInfo.vsize;
      });
      return aggregate;
    }).then(result => {
      return {
        memory: prettyBytes(result.memory),
        memoryRss: prettyBytes(result.memoryInfo.rss),
        memoryVSize: prettyBytes(result.memoryInfo.vsize)
      };
    });
  }

  _loadSyncData() {
    return Promise.resolve({
      name: this.appName,
      version: this.appVersion,
      versionNode: process.version,
      uptimeOs: moment.duration(os.uptime(), 'seconds').humanize(),
      uptimeApp: moment.duration(process.uptime(), 'seconds').humanize(),
      serverCurrentTime: moment().format('YYYY-DD-MM HH:mm:ss.SSS'),
      serverTimezone: dateFormat(Date.now(), 'Z'),
      processCount: Object.keys(cluster.workers).length + 1
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