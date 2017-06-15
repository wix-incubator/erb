module.exports = class SessionRenewer {
  
  constructor(remoteRpc) {
    this._remoteRpc = remoteRpc;
  }
  
  validate(session) {
    return this._remoteRpc.client({}).invoke('validate', {session});
  }
};
