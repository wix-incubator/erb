'use strict';
const wixReqContext = require('wix-req-context'),
  wixPetri = require('wix-petri'),
  wixBi = require('wix-bi'),
  wixSession = require('wix-session');

module.exports.addTo = app => {
  app.get('/aspects/req-context', (req, res) => res.send(wixReqContext.get()));
  app.get('/aspects/petri', (req, res) => res.send(wixPetri.get()));
  app.get('/aspects/bi', (req, res) => res.send(wixBi.get()));
  app.get('/aspects/wix-session', (req, res) => res.send(wixSession.get().session));
};