const {expect} = require('chai'),
  buildUrl = require('../lib/build-url');

describe('build-url', () => {

  it('should return url with trailing slash when no path is given', () => {
    expect(buildUrl(1010)()).to.equal('http://localhost:1010/');
  });

  it('should return url with mount point when no path is given', () => {
    expect(buildUrl(1010, '/point')()).to.equal('http://localhost:1010/point');
  });

  it('should support slash as mount point with no path', () => {
    expect(buildUrl(1010, '/')()).to.equal('http://localhost:1010/');
  });

  it('normalize mount point and path', () => {
    expect(buildUrl(1010)('woop')).to.equal('http://localhost:1010/woop');
    expect(buildUrl(1010)('/woop')).to.equal('http://localhost:1010/woop');
    expect(buildUrl(1010, '/')('/woop')).to.equal('http://localhost:1010/woop');
    expect(buildUrl(1010, '/mount')('/woop')).to.equal('http://localhost:1010/mount/woop');
    expect(buildUrl(1010, '/mount')('woop')).to.equal('http://localhost:1010/mount/woop');
    expect(buildUrl(1010, '/mount/')('/woop/')).to.equal('http://localhost:1010/mount/woop/');
  });
});
