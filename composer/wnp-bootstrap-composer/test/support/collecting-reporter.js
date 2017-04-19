const join = require('path').join;

module.exports = class CollectingReporter {
  constructor() {
    this._appName = 'wix-bootstrap-composer';
  }

  addTo(metrics) {
    this._metrics = metrics;
  }

  meters(name) {
    const fullName = [`root=node_app_info.host=localhost.app_name=${this._appName}`, name].join('.');
    return Object.keys(this._metrics.meters).filter(key => key.indexOf(fullName) > -1);
  }

  hists(name) {
    const fullName = [`root=node_app_info.host=localhost.app_name=${this._appName}`, name].join('.');
    return Object.keys(this._metrics.hists).filter(key => key.indexOf(fullName) > -1);
  }
  
};
