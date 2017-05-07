const Aspect = require('wix-aspects').Aspect,
  _ = require('lodash');

module.exports.builder = () => data => new WixGatekeeperAspect(data);

class WixGatekeeperAspect extends Aspect {
  
  constructor(data) {
    super('gatekeeper', data);
  }

  get authorized() {
    return !_.isEmpty(this._aspect);
  }
  
  authorize(context) {
    this._aspect = context;
  }

  get context() {
    return this.authorized ? this._aspect : undefined;
  }
}
