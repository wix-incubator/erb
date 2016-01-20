'use strict';
const _ = require('lodash');

class AppInfoView {
  constructor(opts) {
    this._mountPath = opts.mountPath;
    this._title = opts.title;
    this._template = opts.template;
  }

  get mountPath() {
    return this._mountPath;
  }

  get title() {
    return this._title;
  }

  get template() {
    return this._template;
  }

  isApi() {
    return _.isFunction(this.api);
  }

  isView() {
    return _.isFunction(this.view);
  }

}

function item(key, value) {
  return {key, value};
}

module.exports.AppInfoView = AppInfoView;
module.exports.item = item;