'use strict';
const expect = require('chai').expect,
  build = require('..').builder();

describe('wix bi aspect', () => {

  const cookies = {
    '_wix_browser_sess': '_wix_browser_sess_123',
    '_wixUIDX': '_wixUIDX_123',
    '_wixCIDX': '_wixCIDX_123',
    'userType': 'userType_123'
  };

  it('should create empty aspect given no matching cookies were provided', () => {
    build({});
  });

  it('should create valid aspect given cookies were provided', () => {
    const aspect = build({cookies});

    expect(aspect.name).to.equal('bi');
    expect(aspect.globalSessionId).to.equal('_wix_browser_sess_123');
    expect(aspect.userId).to.equal('_wixUIDX_123');
    expect(aspect.clientId).to.equal('_wixCIDX_123');
    expect(aspect.userType).to.equal('userType_123');
  });

  it('should not alter aspect upon import', () => {
    const aspect = build({cookies});

    aspect.import({cookies: {'_wixUIDX': '_wixUIDX_456'}});

    expect(aspect.globalSessionId).to.equal('_wix_browser_sess_123');
    expect(aspect.userId).to.equal('_wixUIDX_123');
    expect(aspect.clientId).to.equal('_wixCIDX_123');
    expect(aspect.userType).to.equal('userType_123');
  });

  it('should be noop during export', () => {
    expect(build({cookies}).export()).to.deep.equal({});
  });
});