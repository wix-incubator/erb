'use strict';
const lookup = require('country-data').lookup;

exports.resolve = headers => {
  const maybeCountryCode2 = headers['x-wix-country-code'] || headers['geoip_country_code'];
  const maybeCountries = maybeCountryCode2 ? lookup.countries({'alpha2': maybeCountryCode2}) : [];

  if (maybeCountries.length > 0) {
    return {
      '2lettersCountryCode': maybeCountries[0]['alpha2'],
      '3lettersCountryCode': maybeCountries[0]['alpha3']
    };
  }
};