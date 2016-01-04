'use strict';
const express = require('express'),
  handlebars = require('express-handlebars'),
  packageJson = require('./package-json-loader'),
  pomXml = require('./pom-xml-loader'),
  _ = require('lodash'),
  moment = require('moment'),
  dateFormat = require('dateformat');

const defaults = {
  appDir: './',
  views: []
};

const defaultViews = [
  require('./views/about'),
  require('./views/env')];

const moduleDir = __dirname;

module.exports = opts => new AppInfo(opts);

function AppInfo(opts) {
  const options = _.merge(defaults, opts);
  const appDir = options.appDir;
  const views = defaultViews.concat(options.views).map(fn => fn(appDir));
  const app = initApp();

  app.get('/app-data', (req, res) => {
    pomXml(appDir).then(project => {
      const version = (project.version && _.isArray(project.version)) ? project.version.pop() : undefined;
      const startup = moment().subtract(process.uptime(), 'seconds');
      res.send({
        //TODO: duplicate with views/about - refactor
        serverStartup: dateFormat(startup, 'dd/mm/yyyy HH:MM:ss.l'),
        version: version
      });
    });
  });

  app.get('/', (req, res) => res.redirect('about'));

  views.forEach(view => {
    app.get(view.mountPath, (req, res, next) => {
      view.data.then(data => {
        res.render(view.template, {
          tabs: buildTabs(views, view),
          title: packageJson(appDir).name,
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