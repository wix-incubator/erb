'use strict';
const expect = require('chai').expect,
      remoteIpResolver = require('../lib/remote-ip-resolver');


describe('remote ip', () =>{

  var ip = '192.168.1.1';
  var aRequest = () => {
    return { headers: {}, connection: { remoteAddress: ip } };
  };

  it('should return user ip from wix header', () => {
    var request = aRequest();
    var ipInWixHeader = '1.1.1.1';
    request.headers = {'x-wix-ip': ipInWixHeader};
    expect(remoteIpResolver.resolve(request)).to.be.equal(ipInWixHeader);
  });
  it('should return user ip from x-forward-for', () => {
    var request = aRequest();
    request.headers = { headers: {'x-forwarded-for': ip}};
    expect(remoteIpResolver.resolve(request)).to.be.equal(ip);
  });

  it('should return ip from request', () => {
    expect(remoteIpResolver.resolve(aRequest())).to.be.equal(ip);
  });
});