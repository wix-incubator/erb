'use strict';
const expect = require('chai').expect,
  geoResolver = require('../lib/geo-resolver');

describe('geo resolver', () =>{
  it('should resolve geo from header GEOIP_COUNTRY_CODE', () =>{
    const geo = geoResolver.resolve({ headers: { 'geoip_country_code': 'BR' }});
    expect(geo).to.be.have.property('2lettersCountryCode', 'BR');
    expect(geo).to.be.have.property('3lettersCountryCode', 'BRA');
  });
  it('should resolve geo from header x-wix-country-code', () =>{
    const geo = geoResolver.resolve({ headers: { 'x-wix-country-code': 'BR' }});
    expect(geo).to.be.have.property('2lettersCountryCode', 'BR');
    expect(geo).to.be.have.property('3lettersCountryCode', 'BRA');
  });
  it('should return from wix header because it is more important', () =>{
    const geo = geoResolver.resolve({ headers:
      { 'x-wix-country-code': 'BR' , 'geoip_country_code': 'IL' }
    });
    expect(geo).to.be.have.property('2lettersCountryCode', 'BR');
    expect(geo).to.be.have.property('3lettersCountryCode', 'BRA');
  });
  it('should return null when headers does not exists', () =>{
    const geo = geoResolver.resolve({ headers: {}});
    expect(geo).to.be.null;
  });
});

