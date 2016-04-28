'use strict';
const expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  fetch = require('node-fetch'),
  bootstrapManagement = require('..'),
  express = require('express');

describe('wnp management app', () => {
  const app = aServer().beforeAndAfter();

  it('should server app-info app', () =>
    fetch(app.getUrl('/app-info/about'), {headers: {'accept': 'application/json'}})
      .then(res => res.json())
      .then(json => expect(json).to.contain.deep.property('name', 'app-name'))
  );

  it('should server provided express apps', () =>
    fetch(app.getUrl('/custom'))
      .then(res => res.text())
      .then(text => expect(text).to.equal('from-custom'))
  );

  function aServer() {
    const server = testkit.server();
    const customApp = express().get('/custom', (req, res) => res.send('from-custom'));
    server.getApp().use(bootstrapManagement({app: {name: 'app-name', version: '1.1.1'}}, [customApp]));
    return server;
  }

});