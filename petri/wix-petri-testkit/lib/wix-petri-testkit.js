'use strict';
const rpcTestkit = require('wix-rpc-testkit'),
  TestkitBase = require('wix-testkit-base').TestkitBase;

module.exports.server = opts => new WixPetriServer(opts);

class WixPetriServer extends TestkitBase {
  constructor(opts) {
    super();
    this.server = rpcTestkit.server(opts || {port: 3020});
    const errorResponse = (code, msg) => {return {error: {code: code, message: msg}}};
    this.defaultOnConductExperimentHandler = () => errorResponse(11211, 'no onConductExperiment handler attached');
    this.defaultOnConductAllInScopeHandler = () => errorResponse(11212, 'no onConductAllInScope handler attached');
    this.onConductExperimentHandler = this.defaultOnConductExperimentHandler;
    this.onConductAllInScopeHandler = this.defaultOnConductAllInScopeHandler;

    this.server.addHandler('LaboratoryApi', (req, res) => {
      res.rpc('conductExperiment', (params, respond) => {
        const resp = this.onConductExperimentHandler(params[0], params[1]);
        if (resp.error) {
          respond(resp);
        } else {
          respond({result: resp});
        }
      });
      res.rpc('conductAllInScope', (params, respond) => {
        const resp = this.onConductAllInScopeHandler(params[0]);
        if (resp.error) {
          respond(resp);
        } else {
          respond({result: resp});
        }
      });
    });
  }

  doStart() {
    return this.server.doStart();
  }

  doStop() {
    return this.server.doStop();
  }

  onConductExperiment(cb) {
    this.onConductExperimentHandler = cb;
  }

  onConductAllInScope(cb) {
    this.onConductAllInScopeHandler = cb;
  }

  reset() {
    this.onConductExperimentHandler = this.defaultOnConductExperimentHandler;
    this.onConductAllInScopeHandler = this.defaultOnConductAllInScopeHandler;
  }

  getPort() {
    return this.server.getPort();
  }
}