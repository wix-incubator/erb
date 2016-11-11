const expect = require('chai').expect,
  GatekeeperAccessDenied = require('..').errors.GatekeeperAccessDenied,
  RpcError = require('wix-json-rpc-client').errors.RpcError,
  mapError = require('../lib/map-error');

describe('map-error', () => {

  describe('error mapping', () => {
    it('should return GatekeeperAccessDenied exception for RpcError with code = -14', () => {
      const accessDeniedRpc = new RpcError('anUri', {}, {}, {code: -14});
      expect(mapError(accessDeniedRpc)).to.be.instanceOf(GatekeeperAccessDenied);
    });

    it('should forward RpcError if code != -14', () => {
      const businessError = new RpcError('anUri', {}, {}, {code: -15});
      expect(mapError(businessError)).to.equal(businessError);
    });

    it('should forward other errors', () => {
      const otherError = new Error();
      expect(mapError(otherError)).to.equal(otherError);
    });
  });
});

