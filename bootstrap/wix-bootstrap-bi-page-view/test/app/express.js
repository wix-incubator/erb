module.exports = (app, context) => {
  
  app.engine('my', (path, options, callback) => {
    callback(null, 'rendered');
  });

  app.set('views', './test/views');

  app.get('/page-view', context.pageView.middleware(), (req, res) => {
    if (req.query.fail) {
      throw new Error('boom');
    } else {
      const bi = req.aspects.bi;
      context.pageView.report(req, res)
        .then(() => res.json({clientId: bi.clientId, globalSessionId: bi.globalSessionId}));
    }
  });
  
  app.get('/page-view-with-render', context.pageView.middleware(), (req, res) => {
    res.render('view.my', context.pageView.onRender(req, res));
  });
  
  return app;
};
