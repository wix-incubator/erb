const WixMeasuredMetering = require('wix-measured-metering'),
  defaultLog = require('wnp-debug')('wix-json-rpc-metering');

module.exports = (wixMeasuredFactory, log = defaultLog) => new RpcClientMetering(wixMeasuredFactory, log);

class RpcClientMetering {
  
  constructor(wixMeasuredFactory, log) {
    this._metering = wixMeasuredFactory.collection('tag', 'RPC_CLIENT');
    this._cache = {}; 
    this._log = log;
  }
  
  addTo(rpcClientFactory) {
    rpcClientFactory.on('client', (url, rpcClient) => this._attachTo(url, rpcClient))
  }
  
  _attachTo(url, rpcClient) {
    const service = url.slice(url.lastIndexOf('/') + 1);
    
    rpcClient.on('before', (ctx, method) => {
      ctx.method = method;
      ctx.started = Date.now();
    });
    
    rpcClient.on('success', ctx => this._safelyReportSuccess(service, ctx));
    
    rpcClient.on('failure', (ctx, err) => this._safelyReportFailure(service, ctx, err));
  }
  
  _safelyReportFailure(service, ctx, err) {
    try {
      this._rawFor(service, ctx.method).reportError(err);
    } catch (e) {
      this._log.error('Failed to report metrics', e);
    }
  }
  
  _safelyReportSuccess(service, ctx) {
    try {
      this._rawFor(service, ctx.method).reportDuration(Date.now() - ctx.started);
    } catch(e) {
      this._log.error('Failed to report metrics', e);
    }
  }
  
  _rawFor(service, method) {
    const key = `${service}_${method}`; 
    if (!this._cache[key]) {
      this._cache[key] = new WixMeasuredMetering(this._metering.collection('service', service)).raw('method', method);
    }
    return this._cache[key];
  }
}
