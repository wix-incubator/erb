'use strict';
const fetch = require('node-fetch'),
  expect = require('chai').expect;

module.exports.html = url => fetchHtml(url);

module.exports.htmlSuccess = url => fetchHtml(url)
  .then(res => {
    expect(res.status).to.equal(200);
    return res.text();
  });

module.exports.json = (url, expectedStatus) => fetchJson(url)
  .then(res => {
    expect(res.status).to.equal(expectedStatus);
    return res.json();
  });

module.exports.jsonSuccess = url => module.exports.json(url, 200);

function fetchJson(url) {
  return fetch(url, {
    headers: {
      Accept: 'application/json'
    }
  });
}

function fetchHtml(url) {
  return fetch(url, {
    headers: {
      Accept: 'text/html'
    }
  });
}