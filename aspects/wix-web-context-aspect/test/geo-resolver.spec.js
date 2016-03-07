'use strict';
const expect = require('chai').expect,
  resolve = require('../lib/resolvers/geo').resolve;

describe('geo resolver', () => {

  it('should resolve geo from header GEOIP_COUNTRY_CODE', () =>
    expect(resolve({'geoip_country_code': 'BR'})).to.deep.equal({
      '2lettersCountryCode': 'BR',
      '3lettersCountryCode': 'BRA'
    }));

  it('should resolve geo from header x-wix-country-code', () =>
    expect(resolve({'x-wix-country-code': 'BR'})).to.deep.equal({
      '2lettersCountryCode': 'BR',
      '3lettersCountryCode': 'BRA'
    }));

  it('should return from wix header because it is more important', () =>
    expect(resolve({'x-wix-country-code': 'BR', 'geoip_country_code': 'IL'})).to.deep.equal({
      '2lettersCountryCode': 'BR',
      '3lettersCountryCode': 'BRA'
    }));

  it('should return undefined when headers does not exists', () =>
    expect(resolve({})).to.be.undefined);

});

