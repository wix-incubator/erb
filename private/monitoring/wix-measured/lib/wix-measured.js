const measured = require('measured'),
  tags = require('../lib/tags');

const tagsToPath = tags.tagsToPath,
  sanitize = tags.sanitize;

class WixMeasured {
  constructor(opts) {
    const options = Object.assign({}, {meters: {}, gauges: {}, hists: {}}, opts);
    this._prefix = options.prefix;
    this._meters = options.meters;
    this._gauges = options.gauges;
    this._hists = options.hists;
  }

  _name(type, name) {
    return [this._prefix, type + '=' + sanitize(name)].join('.');
  }

  addReporter(reporter) {
    reporter.addTo(this);
    return this;
  }

  meter(name, count) {
    //TODO: validate input
    const keyName = this._name('meter', name);
    let meter = this._meters[keyName];
    if (!meter) {
      meter = new measured.Meter({rateUnit: 60000});
      this._meters[keyName] = meter;

    }
    meter.mark(count || 1);
  }

  gauge(name, fnOrValue) {
    //TODO: validate input
    if (fnOrValue instanceof Function) {
      this._gauges[this._name('gauge', name)] = new measured.Gauge(fnOrValue);
    } else {
      this._gauges[this._name('gauge', name)] = new measured.Gauge(() => fnOrValue);
    }
  }

  hist(name, value) {
    //TODO: validate input
    const keyName = this._name('hist', name);
    let hist = this._hists[keyName];
    if (!hist) {
      hist = new measured.Histogram();
      this._hists[keyName] = hist;
    }
    hist.update(value);
  }

  get meters() {
    return this._meters;
  }

  get hists() {
    return this._hists;
  }

  get gauges() {
    return this._gauges;
  }


  collection(...tags) {
    const subPath = tagsToPath(tags);
    return new WixMeasured({
      prefix: [this._prefix, subPath].join('.'),
      meters: this._meters,
      gauges: this._gauges,
      hists: this._hists
    });
  }
}

module.exports = WixMeasured;
