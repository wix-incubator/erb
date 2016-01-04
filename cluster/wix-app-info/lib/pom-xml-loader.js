'use strict';
const fs = require('fs'),
  join = require('path').join,
  log = require('wix-logger').get('app-info'),
  xml2js = require('xml2js');

let pomXml;

module.exports = appDir => {
  if (pomXml) {
    return Promise.resolve(pomXml);
  }

  return new Promise(resolve => {
    fs.readFile(join(appDir, 'pom.xml'), (err, data) => {
      if (err) {
        log.error(err);
        pomXml = {};
        resolve(pomXml);
      } else {
        xml2js.parseString(data || '', (err, result) => {
          const xml = err ? {} : result;
          const project = xml.project ? xml.project : {};
          pomXml = project;
          resolve(pomXml);
        });
      }
    });
  });
};