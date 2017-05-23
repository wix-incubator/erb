const expect = require('chai').expect,
  build = require('..').builder(),
  uuid = require('uuid-support').generate;

describe('wix bi aspect', () => {

  const cookies = {
    '_wix_browser_sess': '_wix_browser_sess_123',
    '_wixUIDX': '00000000-0000-0000-0000-000000000000',
    '_wixCIDX': '00000000-0000-0000-0000-000000000001',
    'userType': 'userType_123'
  };

  it('should create empty aspect given no matching cookies were provided', () => {
    build({});
  });

  it('should create valid aspect given cookies were provided', () => {
    const aspect = build({cookies});

    expect(aspect.name).to.equal('bi');
    expect(aspect.globalSessionId).to.equal('_wix_browser_sess_123');
    expect(aspect.userId).to.equal(cookies['_wixUIDX']);
    expect(aspect.clientId).to.equal(cookies['_wixCIDX']);
    expect(aspect.userType).to.equal('userType_123');
    expect(aspect.visitorId).to.be.undefined;
  });
  
  it('should sanitize client id for valid UUID', () => {
    const data = {
      cookies: Object.assign({}, cookies, {'_wixCIDX': 'invalid'})
    };
    const aspect = build(data);
    
    expect(aspect.clientId).to.be.undefined;
  });

  it('should sanitize viewer id for valid UUID', () => {
    const aspect = build({cookies: {'_wixVIDX': 'invalid'}});
    expect(aspect.viewerId).to.be.undefined;
  });
  
  it('should store visitorId if provided', () => {
    const viewerId = uuid();
    const aspect = build({cookies: Object.assign({}, cookies, {'_wixVIDX': viewerId})});
    expect(aspect.visitorId).to.equal(viewerId);
  });

  it('should reuse visitorId for clientId if clientId is missing', () => {
    const viewerId = uuid();
    const aspect = build({cookies: {'_wixVIDX': viewerId}});
    expect(aspect.clientId).to.equal(viewerId);
  });

  it('should not alter aspect upon import', () => {
    const aspect = build({cookies});

    aspect.import({cookies: {'_wixUIDX': uuid()}});

    expect(aspect.globalSessionId).to.equal('_wix_browser_sess_123');
    expect(aspect.userId).to.equal(cookies['_wixUIDX']);
    expect(aspect.clientId).to.equal(cookies['_wixCIDX']);
    expect(aspect.userType).to.equal('userType_123');
  });

  it('should be noop during export', () => {
    expect(build({cookies}).export()).to.deep.equal({});
  });
  
  it('should generate clientId', () => {
    const aspect = build({});
    const clientId = aspect.generateClientId();
    
    expect(clientId).to.be.not.empty;
    expect(aspect.clientId).to.equal(clientId);
  });
  
  it('should not generate clientId if exists', () => {
    const aspect = build({cookies});

    const clientId = aspect.generateClientId();
    
    expect(clientId).to.equal(cookies['_wixCIDX']);
    expect(aspect.clientId).to.equal(cookies['_wixCIDX']);
  });
  
  it('should generate global session id', () => {
    const aspect = build({});
    const globalSessionId = aspect.generateGlobalSessionId();

    expect(globalSessionId).to.be.not.empty;
    expect(aspect.globalSessionId).to.equal(globalSessionId);
  });
  
  it('should not generate global session id if exists', () => {
    const aspect = build({cookies});
    
    const globalSessionId = aspect.generateGlobalSessionId();
    expect(globalSessionId).to.be.equal(cookies['_wix_browser_sess']);
    expect(aspect.globalSessionId).to.equal(globalSessionId);
  });
});
