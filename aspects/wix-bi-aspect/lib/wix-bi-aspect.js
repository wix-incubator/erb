const Aspect = require('wix-aspects').Aspect;

module.exports.builder = () => data => new WixBiAspect(data);

class WixBiAspect extends Aspect {
  constructor(data) {
    super('bi', data);
    const cookies = data.cookies || {};
    this._setIfAny(cookies['_wix_browser_sess'], this._aspect, 'globalSessionId');
    this._setIfAny(cookies['_wixUIDX'], this._aspect, 'userId');
    this._setIfAny(cookies['_wixCIDX'], this._aspect, 'clientId');
    this._setIfAny(cookies['_wixVIDX'], this._aspect, 'visitorId');
    this._setIfAny(cookies['userType'], this._aspect, 'userType');
    this._reuseVisitorIdForClientId();
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
  
  get visitorId() {
    return this._aspect.visitorId;
  }

  get userType() {
    return this._aspect.userType;
  }

  _reuseVisitorIdForClientId() {
    if (!this._aspect.clientId) {
      this._aspect.clientId = this._aspect.visitorId;
    }
  }
  
}
