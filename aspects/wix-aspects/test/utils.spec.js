const expect = require('chai').expect,
  utils = require('..').utils;

describe('utils', () => {

  describe('resolveCookieDomain', () => {
    it('should be .wix.com for www', () =>
      expect(utils.resolveCookieDomain('http://www.wix.com')).to.equal('.wix.com'));

    it('should be .wix.com for any language', () => {
      ['fr', 'pt', 'es'].forEach(lang =>
        expect(utils.resolveCookieDomain('http://' + lang + '.wix.com')).to.equal('.wix.com'));
    });

    it('should be .wix.com for any subdomain', () => {
      ['hotels', 'restaurants', 'ecommerce'].forEach(vertical =>
        expect(utils.resolveCookieDomain('http://' + vertical + '.wix.com')).to.equal('.wix.com'));
    });

    it('should be .cola.wixpress.com for staging env', () =>
      expect(utils.resolveCookieDomain('http://www.cola.wixpress.com')).to.equal('.cola.wixpress.com'));

    it('should be .cola.wixpress.com for staging env in any language', () =>
      ['fr', 'pt', 'es'].forEach(lang =>
        expect(utils.resolveCookieDomain('http://' + lang + '.cola.wixpress.com')).to.equal('.cola.wixpress.com')));

    it('should be .cola.wixpress.com for any subdomain', () =>
      ['hotels', 'restaurants', 'ecommerce'].forEach(vertical =>
        expect(utils.resolveCookieDomain('http://' + vertical + '.cola.wixpress.com')).to.equal('.cola.wixpress.com')));

    it('should be .wix.com for localhost', () =>
      expect(utils.resolveCookieDomain('http://localhost:3333/kfir')).to.equal('.wix.com'));

    it('should be .wix.com for localhost', () =>
      expect(utils.resolveCookieDomain('http://localhost:3333/kfir')).to.equal('.wix.com'));

    it('should be .wix.com for not legal wixpress com', () =>
      expect(utils.resolveCookieDomain('http://wixpress.com/kfir123')).to.equal('.wix.com'));
    
    it('should be .wixsite.com for username.wixsite.com', () =>
      expect(utils.resolveCookieDomain('http://username.wixsite.com/sitename')).to.equal('.wixsite.com'))
    
    it('should be .wix.com for url without protocol', () => {
      expect(utils.resolveCookieDomain('subdomain.wix.com')).to.equal('.wix.com');
    });
  });
});
