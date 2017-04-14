const express = require('express'),
  handlebars = require('express-handlebars'),
  _ = require('lodash'),
  assert = require('assert');

const moduleDir = __dirname;

module.exports = opts => new AppInfo(opts);

function AppInfo(opts) {
  const options = _.merge(defaults(), opts);
  assert(options.profilingResourcesDir, 'Profiling resources directory must be provided, set [profilingResourcesDir] option');

  const views = defaultViews(options).concat(options.views);
  const app = initApp();

  app.get('/', (req, res) => res.redirect('about'));

  views.forEach(view => {
    app.get(view.mountPath, (req, res, next) => renderView(view, options.appName, res, next));
    app.use(`${view.mountPath}/api`, view.api());
  });

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
          mountPath: _.trimStart(view.mountPath, '/'),
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

  function defaultViews(opts) {
    return [
      require('./views/about')(opts.appName, opts.appVersion),
      require('./views/env')(),
      require('./views/heap-dump')(opts.profilingResourcesDir),
      require('./views/cpu-profile')(opts.profilingResourcesDir)];
  }

  return app;
}

function defaults() {
  return {
    appVersion: 'undefined',
    appName: 'undefined',
    views: [],
    profilingResourcesDir: undefined
  };
}
