'use strict';
const wixReqContext = require('wix-req-context'),
  wixPetri = require('wix-petri'),
  wixBi = require('wix-bi'),
  wixSession = require('wix-session'),
  wixDomain = require('wix-domain');

module.exports.addTo = app => {
  app.get('/aspects/req-context', (req, res) => res.send(wixReqContext.get()));
  app.get('/aspects/petri', (req, res) => res.send(wixPetri.get()));
  app.get('/aspects/bi', (req, res) => res.send(wixBi.get()));
  app.get('/aspects/wix-session', (req, res) => res.send(wixSession.get().session));
  app.get('/aspects/wix-domain-promise', (req, res, next) => {
    wixDomain.get().custom = { 'custom-domain-key': 'custom-domain-value'};
    new Promise((resolve, reject) => resolve())
      .then(() => res.json(wixDomain.get().custom))
      .catch(next);
  });
};