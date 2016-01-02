'use strict';
const express = require('express'),
  handlebars = require('express-handlebars'),
  packageJson = require('../package.json'),
  _ = require('lodash');

const defaultViews = [
  require('./views/about'),
  require('./views/env')];

const moduleDir = __dirname;

module.exports = additionalViews => new AppInfo(additionalViews);

function AppInfo(additionalViews) {
  const views = defaultViews.concat(additionalViews || []);
  const app = initApp();

  app.get('/', (req, res) => res.redirect('about'));

  views.forEach(view => {
    app.get(view.mountPath, (req, res, next) => {
      view.data.then(data => {
        res.render(view.template, {
          tabs: buildTabs(views, view),
          title: packageJson.name,
          data: data
        });
      }).catch(next);
    });
  });

  function buildTabs(views, currentView) {
    return views.map(view => {
      return {
        mountPath: _.trimLeft(view.mountPath, '/'),
        title: view.title,
        active: view.mountPath === currentView.mountPath
      };
    });
  }

  function initApp() {
    const viewsDir = moduleDir + '/../views';
    const publicDir = moduleDir + '/../public';

    return express()
      .engine('html', handlebars({defaultLayout: 'layout', extname: '.html', layoutsDir: viewsDir}))
      .set('view engine', '.html')
      .set('views', viewsDir)
      .use(express.static(publicDir));
  }

  return app;
}