'use strict';
const _ = require('lodash'),
  views = require('./commons'),
  Router = require('express').Router;

class EnvironmentView extends views.AppInfoView {
  _data() {
    return process.env;
  }

  api() {
    return new Router().get('/', (req, res) => {
      res.json(this._data());
    });
  }

  view() {
    const res = [];
    _.forIn(this._data(), (value, key) => res.push(views.item(key, value)));
    return Promise.resolve({items: _.sortBy(res, 'key')});
  }
}

module.exports = () => new EnvironmentView({
  mountPath: '/env',
  title: 'Environment',
  template: 'single-column'
});