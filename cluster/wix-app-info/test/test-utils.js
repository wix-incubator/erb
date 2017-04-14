const fetch = require('node-fetch'),
  expect = require('chai').expect,
  parse = require('unzip').Parse,
  Readable = require('stream').Readable;

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

module.exports.checkValidZip = checkValidZip;

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

function checkValidZip(contents, filename) {
  return new Promise((resolve, reject) => {
    const stream = new Readable();
    stream._read = function noop() {};
    stream.push(contents);
    stream.push(null);
    stream.pipe(parse())
      .on('entry', function (entry) {
        expect(entry.type).to.eq('File');
        expect(entry.path).to.eq(filename);
        entry.autodrain();
        resolve();
      })
      .on('error', reject);
  });
}
