'use strict';
module.exports.addTo = app => {
  app.get('/aspects/req-context', (req, res) => res.send(req.aspects['web-context']));
  app.get('/aspects/petri', (req, res) => res.send(req.aspects['petri'].cookies));
  app.get('/aspects/bi', (req, res) => res.send(req.aspects['bi']));
  app.get('/aspects/wix-session', (req, res) => res.send(req.aspects['session']));
};