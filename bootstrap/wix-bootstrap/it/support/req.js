'use strict';
const _ = require('lodash'),
  fetch = require('node-fetch');

module.exports.get = aGet;

function aGet(url, opts) {
  const options = _.merge({
    headers: {
      Accept: 'application/json'
    }
  }, opts || {});

  let result;
  return fetch(url, options)
    .then(res => {
      result = res;
      return res.text();
    })
    .then(text => {
        result.text = text;
        result.json = () => tryParseJson(result.text);
        return result;
      }
    );
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}