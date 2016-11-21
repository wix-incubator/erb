'use strict';
const views = require('./commons'),
  os = require('os'),
  moment = require('moment'),
  dateFormat = require('dateformat'),
  wixClusterCient = require('wix-cluster-client'),
  Router = require('express').Router;

class AboutView extends views.AppInfoView {
  constructor(opts) {
    super(opts);
    this.clusterClient = wixClusterCient();
    this.appName = opts.appName;
    this.appVersion = opts.appVersion;
  }

  _data() {
    return {
      name: this.appName,
      version: this.appVersion,
      versionNode: process.version,
      uptimeOs: moment.duration(os.uptime(), 'seconds').humanize(),
      uptimeApp: moment.duration(process.uptime(), 'seconds').humanize(),
      serverCurrentTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
      serverTimezone: dateFormat(Date.now(), 'Z'),
      workerCount: this.clusterClient.workerCount,
      workerDeathCount: this.clusterClient.deathCount
    };
  }

  api() {
    return new Router().get('/', (req, res) => {
      res.json(this._data());
    });
  }

  view() {
    return Promise.resolve(this._data()).then(res => {
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
          views.item('Worker process death count', res.workerDeathCount)
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