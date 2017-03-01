module.exports = class FilteringReporter {
  addTo(measured) {
    this._registry = measured;
  }

  meters(key) {
    return this._findKeyIn(this._registry.meters, key);
  }

  gauges(key) {
    return this._findKeyIn(this._registry.gauges, key);
  }

  hists(key) {
    return this._findKeyIn(this._registry.hists, key);
  }

  _findKeyIn(where, keyPart) {
    const matchedKey = Object.keys(where).find(el => el.indexOf(keyPart) > -1);
    if (matchedKey) {
      return where[matchedKey];
    }
  }
}
