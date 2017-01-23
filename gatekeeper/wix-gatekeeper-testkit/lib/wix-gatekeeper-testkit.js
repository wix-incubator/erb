const rpcTestkit = require('wix-rpc-testkit'),
  TestkitBase = require('wix-testkit-base').TestkitBase,
  wixSessionAspect = require('wix-session-aspect'),
  wixSessionCrypto = require('wix-session-crypto');

module.exports.server = opts => new WixGatekeeperServer(opts);

class WixGatekeeperServer extends TestkitBase {
  constructor(opts) {
    super();
    this._server = rpcTestkit.server(opts || {port: 3029});
    this._userPermissions = [];

    this._server.addHandler('GatekeeperService', (req, res) => {
      extractUserGuid(req, userGuid => {
        res.rpc('authorize', (params, respond) => {
          const resp = this._onAuthorizeHandler(userGuid, params[0], params[1]);
          if (resp.error) {
            respond(resp);
          } else {
            respond({result: {}});
          }
        });
      });
    });
  }

  _onAuthorizeHandler(userId, metasiteId, permission) {
    const authorized = this._userPermissions.some(elem => elem(userId, metasiteId, permission));
    return authorized ? {} : {error: {code: -14, message: 'access denied'}};
  };

  doStart() {
    return this._server.doStart();
  }

  doStop() {
    return this._server.doStop();
  }

  givenUserPermission(givenUserId, givenMetaSiteId, givenPermission) {
    this._userPermissions.push((userId, metaSiteId, permission) => {
      return userId === givenUserId &&
             metaSiteId === givenMetaSiteId &&
             permission.scope === givenPermission.scope &&
             permission.action === givenPermission.action;
    });
  }

  givenUserPermissionHandler(handler) {
    this._userPermissions.push(handler);
  }

  reset() {
    this._userPermissions = [];
  }

  getPort() {
    return this._server.getPort();
  }
}

//TODO: maybe could be exposed by wix-rpc-client-support or smth similar
function extractUserGuid(req, next) {
  var sessionAspect = wixSessionAspect.builder(
    token => wixSessionCrypto.v1.get(wixSessionCrypto.v1.devKey).decrypt(token),
    token => wixSessionCrypto.v2.get(wixSessionCrypto.v2.devKey).decrypt(token)
  );

  const data = {cookies: {
    'wixSession': req.headers['x-wix-session'],
    'wixSession2': req.headers['x-wix-session2']
  }};
  return next(sessionAspect(data).userGuid);
}
