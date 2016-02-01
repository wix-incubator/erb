'use strict';
const env = require('./environment'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('app', function () {
  this.timeout(10000);
  env.start();

  it('should return metasite details by metasiteId', () =>
    fetch(env.app.getUrl('/site/5ae0b98c-8c82-400c-b76c-a191b71efca5')).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => {
      expect(json).to.contain.deep.property('id', '5ae0b98c-8c82-400c-b76c-a191b71efca5');
      expect(json).to.contain.deep.property('name', 'das-site');
    })
  );
});