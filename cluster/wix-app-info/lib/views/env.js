'use strict';
const _ = require('lodash'),
  views = require('./commons');

class EnvironmentView extends views.AppInfoView {
  api() {
    return Promise.resolve(process.env);
  }

  view() {
    return this.api().then(env => {
      const res = [];
      _.forIn(env, (value, key) => res.push(views.item(key, value)));
      return Promise.resolve({items: _.sortBy(res, 'key')});
    });
  }
}

module.exports = () => new EnvironmentView({
  mountPath: '/env',
  title: 'Environment',
  template: 'single-column'
});