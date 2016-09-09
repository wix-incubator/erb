'use strict';
const fetch = require('node-fetch'),
  expect = require('chai').expect;

['get', 'post', 'put', 'delete', 'options', 'patch'].forEach(method => {
  module.exports[method] = (url, options) => executeAndVerify(method, url, options)
});

const isFn = o => typeof(o) === 'function';

const fetchHttp = (method, url, options) => {
  const heads = options ? options.headers || {} : {};
  if (options && options.body) {
    options.body = JSON.stringify(options.body)
  }
  const modifyingMethods = ['post', 'put', 'patch'];
  const headersWithDefaults = modifyingMethods.indexOf(method) > -1 ? Object.assign({ 'Content-Type': 'application/json' }, heads) : heads;
  return fetch(url, Object.assign({}, options, { method: method, headers: headersWithDefaults }));
};

const executeAndVerify = (method, url, options) => {
  let resp;
  const httpPromise = fetchHttp(method, url, options)
    .then(res => {
      resp = res;
      return res.text()
    })
    .then(text => {
      resp.text = () => text;
      resp.json = () => textToJson(text);
      return resp;
    });

  httpPromise.verify = addVerifications(httpPromise);
  return httpPromise;
};

const addVerifications = httpPromise => expectations => {
  const expects = expectations || {};
  return httpPromise
    .then(res => {
      verifyStatus(res.status, expects.status);
      verifyHeaders(res.headers, expects.headers);
      verifyBody(res.json, expects.json, 'Response JSON body');
      verifyBody(res.text, expects.text, 'Response text body');
      return res;
    })
};

const verifyStatus = (status, expected) => {
  if (isFn(expected)) {
    expected(status)
  } else if (expected) {
    expect(status, 'Response status code').to.equal(expected);
  } else {
    expect(status, 'Response status code successful').to.be.within(200, 299);
  }
};

const verifyHeaders = (headers, expected) => {
  if (isFn(expected)) {
    expected(headers);
  } else if (expected) {
    Object.keys(expected).forEach(key => {
      expect(headers.get(key), `Response header ${key}`).to.exist // eslint-disable-line no-unused-expressions
      expect(headers.get(key), `Response header ${key}`).to.equal(expected[key])
    });
  }
};

const verifyBody = (body, expected, msg) => {
  if (isFn(expected)) {
    expected(body())
  } else if (expected) {
    expect(body(), msg).to.deep.equal(expected)
  }
};

const textToJson = text => {
  let res;
  try {
    res = JSON.parse(text);
  } catch (e) {
    throw new Error(`${text} is not valid JSON!`)
  }
  return res;
};

