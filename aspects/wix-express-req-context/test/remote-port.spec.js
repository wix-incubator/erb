'use strict';
const expect = require('chai').expect,
      remoteIpResolver = require('../lib/remote-port-resolver');


describe('remote port', () =>{

  var remotePort = 2222;
  var aRequest = () => {
    return { headers: {}, connection: { remotePort: remotePort } };
  };

  it('shpuld return user ip from wix header', () => {
    var request = aRequest();
    var portInHeader = 3333;
    request.headers = {'x-wix-default-port': portInHeader};
    expect(remoteIpResolver.resolve(request)).to.be.equal(portInHeader);
  });

  it('should return user port from request', () => {
    expect(remoteIpResolver.resolve(aRequest())).to.be.equal(remotePort);
  });
});