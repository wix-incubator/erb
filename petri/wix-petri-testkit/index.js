const rpcTestkit = require('wix-rpc-testkit'),
  TestkitBase = require('wix-testkit-base').TestkitBase,
  defaultPort = require('wix-test-ports').PETRI,
  extractOverrides = require('wix-petri-aspect').extractOverrides;

module.exports.server = opts => new WixPetriServer(opts);

class WixPetriServer extends TestkitBase {
  constructor(opts) {
    super();
    this.server = rpcTestkit.server(opts || {port: defaultPort});
    const errorResponse = (code, msg) => {return {error: {code: code, message: msg}}};
    this.defaultOnConductExperimentHandler = () => errorResponse(11211, 'no onConductExperiment handler attached');
    this.defaultOnConductAllInScopeHandler = () => errorResponse(11212, 'no onConductAllInScope handler attached');
    this.onConductExperimentHandler = this.defaultOnConductExperimentHandler;
    this.onConductAllInScopesHandler = this.defaultOnConductAllInScopeHandler;

    this.server.addHandler('LaboratoryApi', (req, res) => {
      res.rpc('conductExperiment', (params, respond) => {
        const resp = overrides({from: req, forKey: params[0], orElse: () => this.onConductExperimentHandler(params[0], params[1])});
        if (resp.error) {
          respond(resp);
        } else {
          respond({result: resp});
        }
      });
      res.rpc('conductAllInScopes', (params, respond) => {
        const resp = overrides({from: req, at: this.onConductAllInScopesHandler(params[0])});
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
    this.onConductAllInScopesHandler = withFirstScope(cb);
  }
  
  onConductAllInScopes(cb) {
    this.onConductAllInScopesHandler = cb;
  }

  reset() {
    this.onConductExperimentHandler = this.defaultOnConductExperimentHandler;
    this.onConductAllInScopesHandler = this.defaultOnConductAllInScopeHandler;
  }

  getPort() {
    return this.server.getPort();
  }
}

function withFirstScope(cb) {
  return scopes => cb(scopes[0])
}

function overrides({from, forKey, orElse, at}) {
  const overrides = extractOverrides(from);
  if (at) {
    for (let key in at) {
      if (overrides[key]) {
        at[key] = overrides[key];
      }
    }
    return at;
  } else {
    if (overrides[forKey]) {
      return overrides[forKey];
    } else {
      return orElse();
    }
  }
}
