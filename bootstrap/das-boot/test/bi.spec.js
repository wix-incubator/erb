'use strict';
const env = require('./environment'),
  expect = require('chai').expect,
  fetch = require('node-fetch'),
  biTestkit = require('wix-bi-node-testkit');

describe('bi', function () {
  this.timeout(10000);
  env.start();
  const biEvents = biTestkit.interceptor().beforeAndAfterEach();

  it('should log bi messages to files', () =>
    fetch(env.app.getUrl('/bi/event')).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(() => {
      const event = biEvents.events.pop();
      expect(event).to.contain.property('evid', 300);
      expect(event).to.contain.property('src', 11);
    }));
});