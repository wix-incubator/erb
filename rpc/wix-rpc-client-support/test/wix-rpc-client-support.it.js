const expect = require('chai').expect,
  chance = require('chance')(),
  jsonrpc = require('node-express-json-rpc2'),
  testkit = require('wix-http-testkit'),
  reqOptions = require('wix-req-options'),
  aspectStore = require('wix-aspects'),
  biAspect = require('wix-bi-aspect'),
  petriAspect = require('wix-petri-aspect'),
  webContextAspect = require('wix-web-context-aspect'),
  wixRpcClientSupport = require('..'),
  rpcClient = require('wix-json-rpc-client'),
  sessionTestkitProvider = require('wix-session-crypto-testkit'),
  wixSessionAspect = require('wix-session-aspect'),
  {WixSessionCrypto, devKey} = require('wix-session-crypto');

describe('wix rpc client support', () => {
  const server = rpcServer().beforeAndAfter();

  it('should pass-on bi headers into rpc request', () => {
    const req = reqOptions.builder().withBi().raw();
    const store = anAspectStore(req);

    return rpcGet(server.getUrl(), store).then(res => {
      expect(res).to.contain.deep.property('x-wix-client-global-session-id', req.cookies['_wix_browser_sess']);
      expect(res).to.contain.deep.property('x-wix-client-id', req.cookies['_wixCIDX']);
    });
  });

  it('should inject caller-id', () => {
    const req = reqOptions.builder().withBi().raw();
    const store = anAspectStore(req);

    return rpcGet(server.getUrl(), store).then(res => {
      expect(res).to.contain.property('x-wix-rpc-caller-id', 'this-artifact@localhost');
    });
  });

  it('should pass-on petri cookies', () => {
    const userId = chance.guid();
    const req = reqOptions.builder()
      .withPetriAnonymous(1, 2)
      .withPetri(userId, 4, 6)
      .withPetri(userId, 10, 20).raw();
    const store = anAspectStore(req);

    return rpcGet(server.getUrl(), store).then(res => {
      expect(res).to.contain.property('x-wix-petri-anon-rpc', '1#2');
      expect(res).to.contain.property(`x-wix-petri-users-rpc-${userId}`, '4#6|10#20');
    });
  });

  it('should pass-on petri overrides', () => {
    const req = reqOptions.builder()
      .withPetriOverride('aSpecKey', 'aValue');
    const store = anAspectStore(req);

    return rpcGet(server.getUrl(), store).then(res =>
      expect(res).to.contain.property('x-wix-petri-ex', 'aSpecKey:aValue'));
  });


  it('should inject signature', () => {
    const req = reqOptions.builder().raw();
    const store = anAspectStore(req);

    return rpcGet(server.getUrl(), store).then(res =>
      expect(res).to.contain.property('x-wix-signature').to.be.not.empty
    );
  });

  it('should pass-on headers from web-context', () => {
    const req = reqOptions.builder().raw();
    const store = anAspectStore(req);

    return rpcGet(server.getUrl(), store).then(res => {
      ['x-wix-request-id', 'x-wix-default_port', 'x-wix-ip',
        'x-wix-language', 'x-wix-country-code', 'x-wix-forwarded-url'].forEach(el =>
        expect(res).to.contain.property(el, req.headers[el]));
    });
  });

  it('should pass-on session from request for wixSession2', () => {
    const session = sessionTestkitProvider.aValidBundle();
    const req = reqOptions.builder()
      .withSession(session);
    const store = anAspectStore(req);

    return rpcGet(server.getUrl(), store).then(res =>
      expect(res).to.contain.property('x-wix-session2', req.wixSession.token)
    );
  });


  it('should inject seen-by returned from response into aspect store', () => {
    const req = reqOptions.builder();
    const store = anAspectStore(req);

    return rpcGet(server.getUrl(), store).then(() =>
      expect(store['web-context'].seenBy).to.deep.equal(['seen-by-me', 'rpc-server'])
    );
  });

  it('should inject petri cookies returned from response into aspect store', () => {
    const req = reqOptions.builder();
    const store = anAspectStore(req);

    return rpcGet(server.getUrl(), store).then(() =>
      expect(store['petri'].cookies).to.contain.property('_wixAB3', '10#1')
    );
  });

  function rpcServer() {
    const server = testkit.server();
    server.getApp()
      .use(jsonrpc())
      .post('/', (req, res) => res.rpc('req', (params, respond) => {
        res.set('x-seen-by', 'rpc-server');
        res.cookie('_wixAB3', '10#1');
        respond({result: req.headers});
      }));

    return server;
  }

  function rpcGet(url, store) {
    const rpcFactory = rpcClient.factory();
    wixRpcClientSupport.get({
      rpcSigningKey: '1234567890',
      callerIdInfo: {
        host: 'localhost',
        artifactId: 'this-artifact'
      }
    }).addTo(rpcFactory);
    return rpcFactory.clientFactory(url).client(store).invoke('req');
  }

  function anAspectStore(req) {
    const reqData = {
      url: 'http://fanta.wixpress.com/woop',
      remotePort: 1233,
      remoteAddress: '127.0.2.2',
      headers: req.headers,
      cookies: req.cookies
    };
    return aspectStore.buildStore(reqData, [
      biAspect.builder(),
      petriAspect.builder(),
      webContextAspect.builder('seen-by-me'),
      wixSessionAspect.builder(token => new WixSessionCrypto(devKey).decrypt(token))]);
  }
});
