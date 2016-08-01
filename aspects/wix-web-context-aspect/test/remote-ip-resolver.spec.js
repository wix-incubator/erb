'use strict';
const expect = require('chai').expect,
  resolve = require('../lib/resolvers/remote-ip').resolve;

describe('remote ip resolver', () => {

  it('should return user ip from wix header', () =>
    expect(resolve({'x-wix-ip': '1.1.1.1'}, '192.168.1.1')).to.be.equal('1.1.1.1'));

  it('should return ip from request', () =>
    expect(resolve({},'192.168.1.1')).to.be.equal('192.168.1.1'));

});