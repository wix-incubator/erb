'use strict';
module.exports = app => {
  let initialized = false;
  app.get('/', (req, res) => res.end());
  app.get('/initialized', (req, res) => res.send(initialized));
  return new Promise(resolve => {
    setTimeout(() => {
      initialized = true;
      resolve();
    }, 2000);
  })
};