'use strict';
const _ = require('lodash'),
  request = require('request'),
  join = require('path').join;

module.exports.http = (opts, passed) => new HttpCheck(opts, passed);
module.exports.httpGet = path => new HttpGetCheck(path);
module.exports.stdErr = str => new StdErrCheck(str);
module.exports.stdOut = str => new StdOutCheck(str);

function HttpCheck(opts, passed) {
  this.invoke = (context, success, failure) => {
    request(opts, (err, res, body) => {
      return passed(err, res, body) ? success() : failure(err);
    });
  };
}

function HttpGetCheck(path) {

  function reqOptions(env) {
    return {
      method: 'GET',
      uri: `http://localhost:${env.PORT}${join(env.MOUNT_POINT || '/', path)}`
    };
  }

  this.invoke = (context, success, failure) => {
    new HttpCheck(
      reqOptions(context.env),
      (err, res) => (_.isNull(err) && (res && res.statusCode >= 200 && res.statusCode < 300)))
      .invoke(context, success, failure);
  };
}

function StdErrCheck(str) {
  this.invoke = (context, success, failure) => (_.includes(context.stderr().join(''), str)) ? success() : failure()
}

function StdOutCheck(str) {
  this.invoke = (context, success, failure) => (_.includes(context.stdout().join(''), str)) ? success() : failure()
}