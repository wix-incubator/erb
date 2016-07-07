'use strict';
const env = require('./environment'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('app', function () {
  this.timeout(10000);

  it('should respond with hi on hello', () =>
    fetch(env.app.getUrl('/api/hello')).then(res => {
      expect(res.status).to.equal(200);
      return res.text();
    }).then(text => expect(text).to.equal('hi'))
  );

  it('should return metasite details by metasiteId', () =>
    fetch(env.app.getUrl('/api/rpc/site/5ae0b98c-8c82-400c-b76c-a191b71efca5')).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => {
      expect(json).to.contain.deep.property('id', '5ae0b98c-8c82-400c-b76c-a191b71efca5');
      expect(json).to.contain.deep.property('name', 'das-site');
    })
  );

  it('should log bi messages to files', () =>
    fetch(env.app.getUrl('/api/bi/event'))
      .then(res => expect(res.status).to.equal(200))
      .then(() => {
        const event = env.biEvents().pop();
        expect(event).to.contain.property('evid', 300);
        expect(event).to.contain.property('src', 11);
      })
  );

  it('should conduct experiment', () =>
    fetch(env.app.getUrl('/api/petri/aSpec/false'))
      .then(res => {
        expect(res.status).to.equal(200);
        return res.text();
      }).then(result => expect(result).to.equal('true'))
  );

});