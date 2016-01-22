'use strict';
const express = require('express'),
  handlebars = require('express-handlebars'),
  _ = require('lodash'),
  appData = require('./app-data');

const moduleDir = __dirname;

module.exports = opts => new AppInfo(opts);

function AppInfo(opts) {
  const options = trimVersion(_.merge(defaults(), opts));
  const views = defaultViews(options).concat(options.views);
  const app = initApp();

  app.get('/', (req, res) => res.redirect('about'));
  app.get('/app-data', appData(options.appVersion));

  views.forEach(view => {
    app.get(view.mountPath, (req, res, next) => {
      if (req.accepts('html')) {
        renderView(view, options.appName, res, next);
      } else {
        renderApi(view, res, next);
      }
    });
  });

  function renderApi(view, res, next) {
    if (view.isApi()) {
      view.api().then(json => res.json(json)).catch(next);
    } else {
      res.status(404).end();
    }
  }

  function renderView(view, appName, res, next) {
    if (view.isView()) {
      view.view().then(data =>
        res.render(view.template, {
          tabs: buildTabs(views, view),
          title: appName,
          data: data
        })).catch(next);
    } else {
      res.status(404).end();
    }
  }

  function buildTabs(views, currentView) {
    return _.compact(views.map(view => {
      if (view.isView()) {
        return {
          mountPath: _.trimLeft(view.mountPath, '/'),
          title: view.title,
          active: view.mountPath === currentView.mountPath
        };
      }
    }));
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

  function trimVersion(opts) {
    opts.appVersion = opts.appVersion.trim().replace('-SNAPSHOT', '');
    return opts;
  }

  function defaultViews(opts) {
    return [
      require('./views/about')(opts.appName, opts.appVersion),
      require('./views/env')()];
  }

  return app;
}

function defaults() {
  return {
    appVersion: 'undefined',
    appName: 'undefined',
    views: []
  };
}