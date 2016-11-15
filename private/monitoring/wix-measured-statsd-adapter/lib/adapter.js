class WixMeasuredStatsdAdapter {
  //TODO: validate input
  constructor(statsd, opts) {
    const options = Object.assign({interval: 30000}, opts);
    this._client = statsd;
    this._measureds = [];

    this._interval = setInterval(() => this._send(), options.interval);
  }

  _send() {
    this._measureds.forEach(instance => {
      Object.keys(instance.gauges).forEach(key => {
        //TODO: test toFixed
        this._client.gauge(key, instance.gauges[key].toJSON().toFixed(2))
      });

      Object.keys(instance.meters).forEach(key => {
        const meter = instance.meters[key].toJSON();
        this._client.gauge(key + '.count', meter.count);
        //TODO: test toFixed
        this._client.gauge(key + '.m1_rate', meter['1MinuteRate'].toFixed(2));
      });

      Object.keys(instance.hists).forEach(key => {
        const meter = instance.hists[key].toJSON();
        this._client.gauge(key + '.median', meter.median.toFixed(2));
        this._client.gauge(key + '.p75', meter.p75.toFixed(2));
        this._client.gauge(key + '.p95', meter.p95.toFixed(2));
        this._client.gauge(key + '.p99', meter.p99.toFixed(2));
      });
    });
  }

  addTo(measured) {
    this._measureds.push(measured);
    return this;
  }

  stop() {
    clearInterval(this._interval);
    this._send();
  }
}

module.exports = WixMeasuredStatsdAdapter;
