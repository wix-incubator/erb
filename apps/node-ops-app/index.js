'use strict';
const bootstrap = require('./lib/composer');

bootstrap()
  .express('./lib/express-app')
  .start();
// const runner = require('./lib/runner'),
//   expressApp = require('./lib/express-app'),
//   managementApp = require('./lib/management-app');
//
// runner(() => {
//   return expressApp().then(closeMain => {
//     return managementApp().then(closeManagement => {
//       return () => Promise.all([closeMain, closeManagement].map(fn => fn()));
//     });
//   })
// });