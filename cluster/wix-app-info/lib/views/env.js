'use strict';
const _ = require('lodash'),
  views = require('./commons');

class EnvironmentView extends views.AppInfoView {
  get data() {
    const res = [];
    _.forIn(process.env, (value, key) => res.push(views.item(key, value)));
    return Promise.resolve({items: _.sortBy(res, 'key')});
  }
}

module.exports = appDir => new EnvironmentView({
  appDir: appDir,
  mountPath: '/env',
  title: 'Environment',
  template: 'single-column'
});