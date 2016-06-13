'use strict';
const Aspect = require('wix-aspects').Aspect;

module.exports.builder = () => data => new WixBiAspect(data);

class WixBiAspect extends Aspect {
  constructor(data) {
    super('bi', data);
    const cookies = data.cookies || {};
    this._setIfAny(cookies['_wix_browser_sess'], this._aspect, 'globalSessionId');
    this._setIfAny(cookies['_wixUIDX'], this._aspect, 'userId');
    this._setIfAny(cookies['_wixCIDX'], this._aspect, 'clientId');
    this._setIfAny(cookies['userType'], this._aspect, 'userType');
  }

  get globalSessionId() {
    return this._aspect.globalSessionId;
  }

  get userId() {
    return this._aspect.userId;
  }

  get clientId() {
    return this._aspect.clientId;
  }

  get userType() {
    return this._aspect.userType;
  }
}