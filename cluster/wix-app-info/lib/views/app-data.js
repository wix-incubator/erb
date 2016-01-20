'use strict';
const views = require('./commons'),
  moment = require('moment');

class AppData extends views.AppInfoView {
  constructor(opts) {
    super(opts);
    this.appVersion = opts.appVersion;
  }

  api() {
    return Promise.resolve({
      serverStartup: moment().subtract(process.uptime(), 'seconds').format('DD/MM/YYYY HH:mm:ss.SSS'),
      version: this.appVersion
    });
  }
}

module.exports = appVersion => new AppData({
  appVersion: appVersion,
  mountPath: '/app-data'
});