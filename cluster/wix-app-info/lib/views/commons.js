'use strict';

class AppInfoView {
  constructor(opts) {
    this._appDir = opts.appDir;
    this._mountPath = opts.mountPath;
    this._title = opts.title;
    this._template = opts.template;
  }

  get appDir() {
    return this._appDir;
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

  get data() {
    return Promise.reject(Error('Implementation is missing.'));
  }
}

function item(key, value) {
  return {key, value};
}

module.exports.AppInfoView = AppInfoView;
module.exports.item = item;