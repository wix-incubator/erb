'use strict';

const iso3166 = require('iso3166-1'),
      _ = require('lodash');

exports.resolve = request => {
  const geoIpHeaderValue = request.headers['geoip_country_code'];
  const geoIpWixHeaerValue = request.headers['x-wix-country-code'];


  // TODO - need to refactor this
  return _.reduce([geoIpWixHeaerValue, geoIpHeaderValue], (res, val) => {
    if(res !== null ) {
      return res;
    }else if(val) {
      const threeLetter = iso3166.from(val).to3();
      return {
        '2lettersCountryCode': val,
        '3lettersCountryCode': threeLetter
      };
    } else {
      return null;
    }
  }, null);
};