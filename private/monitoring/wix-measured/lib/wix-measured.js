'use strict';
const measured = require('measured'),
  tags = require('../lib/tags'),
  assert = require('assert');

class WixMeasured {
  constructor(opts) {
    const options = Object.assign({}, {prefix: '', meters: {}, gauges: {}, hists: {}}, opts);
    this._prefix = !options.prefix || options.prefix === '' ? '' : options.prefix + '.';
    this._meters = options.meters;
    this._gauges = options.gauges;
    this._hists = options.hists;
  }

  _name(type, name) {
    return this._prefix + type + '=' + tags.sanitize(name);
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
      meter = new measured.Meter({rateUnit: 60000, tickInterval: 30000});
      this._meters[keyName] = meter;

    }
    meter.mark(count || 1);
  }

  gauge(name, fn) {
    //TODO: validate input
    this._gauges[this._name('gauge', name)] = new measured.Gauge(fn);
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


  collection(collectionTags) {
    assert(collectionTags && Object.keys(collectionTags).length > 0, 'tags object with at least 1 tag must be provided');
    return new WixMeasured({
      prefix: this._prefix + tags.tagsToPrefix(collectionTags),
      meters: this._meters,
      gauges: this._gauges,
      hists: this._hists
    });
  }
}

module.exports = WixMeasured;