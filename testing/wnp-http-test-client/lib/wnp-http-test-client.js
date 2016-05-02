'use strict';
const fetch = require('node-fetch'),
  expect = require('chai').expect,
  _ = require('lodash');

module.exports = enrichedFetch('GET');

module.exports.accept = {
  json: {headers: {accept: 'application/json'}}
};

['get', 'put', 'post', 'delete'].forEach(function(method) {
  module.exports[method] = enrichedFetch(method.toUpperCase());
});

['Get', 'Put', 'Post', 'Delete'].forEach(method => {
  module.exports['ok' + method] = (url, opts) => enrichedFetch(method.toUpperCase())(url, opts)
    .then(res => {
      expect(res.ok).to.equal(true);
      return res;
    });
});

function enrichedFetch(method) {
  return function (url) {
    const rest = Array.prototype.slice.call(arguments, 1);
    return fetch(url, _.merge.apply({}, [{method: method}].concat(rest)))
      .then(res => {
        return res.text().then(text => {
          res.text = () => text;
          res.json = () => safeTextToJson(text);
          return res;
        });
      });
  }
}

function safeTextToJson(text) {
  let res;
  try {
    res = JSON.parse(text);
  } catch (e) {

  }

  return res;
}