'use strict';
const expect = require('chai').expect,
  cookieDomainResolver = require('../lib/cookie-domain-resolver');


describe('cookie domain resolver', () =>{

  it('should be .wix.com for www', () =>{
    expect(cookieDomainResolver.resolve('http://www.wix.com')).to.equal('.wix.com');
  });
  it('should be .wix.com for any language', () =>{
    ['fr', 'pt', 'es'].forEach(lang => {
      expect(cookieDomainResolver.resolve('http://' + lang + '.wix.com')).to.equal('.wix.com');
    });
  });
  it('should be .wix.com for any subdomain', () =>{
    ['hotels', 'restaurants', 'ecommerce'].forEach(vertical => {
      expect(cookieDomainResolver.resolve('http://' + vertical + '.wix.com')).to.equal('.wix.com');
    });
  });
  it('should be .cola.wixpress.com for staging env', () =>{
    expect(cookieDomainResolver.resolve('http://www.cola.wixpress.com')).to.equal('.cola.wixpress.com');
  });
  it('should be .cola.wixpress.com for staging env in any language', () =>{
    ['fr', 'pt', 'es'].forEach(lang => {
      expect(cookieDomainResolver.resolve('http://' + lang + '.cola.wixpress.com')).to.equal('.cola.wixpress.com');
    });
  });
  it('should be .cola.wixpress.com for any subdomain', () =>{
    ['hotels', 'restaurants', 'ecommerce'].forEach(vertical => {
      expect(cookieDomainResolver.resolve('http://' + vertical + '.cola.wixpress.com')).to.equal('.cola.wixpress.com');
    });
  });
  it('should be .wix.com for localhost', () => {
    expect(cookieDomainResolver.resolve('http://localhost:3333/kfir')).to.equal('.wix.com');
  });
  it('should be .wix.com for localhost', () => {
    expect(cookieDomainResolver.resolve('http://localhost:3333/kfir')).to.equal('.wix.com');
  });
  it('should be .wix.com for not legal wixpress com', () => {
    expect(cookieDomainResolver.resolve('http://wixpress.com/kfir123')).to.equal('.wix.com');
  });



});