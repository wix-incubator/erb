const join = require('path').join;

//TODO: duplicated, can we reuse from sibling module? extract to inner testkit?
module.exports = class CollectingReporter {
  constructor() {
    this._packageJson = require(join(process.cwd(), 'package.json'));
  }

  addTo(metrics) {
    this._metrics = metrics;
  }

  meters(name) {
    const fullName = [`root=node_app_info.host=localhost.app_name=${this._packageJson.name}`, name].join('.');
    return Object.keys(this._metrics.meters).filter(key => key.indexOf(fullName) > -1);
  }

  hists(name) {
    const fullName = [`root=node_app_info.host=localhost.app_name=${this._packageJson.name}`, name].join('.');
    return Object.keys(this._metrics.hists).filter(key => key.indexOf(fullName) > -1);
  }
};
