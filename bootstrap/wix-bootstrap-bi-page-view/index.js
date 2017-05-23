const expressMiddleware = require('./lib/express-middleware'),
  config = require('./lib/configuration'),
  reporter = require('./lib/reporter');

module.exports.di = {
  key: 'pageView',
  value: context => {
    const cookieDomain = config.load({env: context.env, config: context.config});
    return {
      middleware: () => expressMiddleware,
      report: reporter(context.bi, cookieDomain),
      onRender: (req, res) => (err, html) => {
        if (html) {
          reporter(context.bi, cookieDomain)(req, res).then(() => res.send(html));
        }
      }
    }
  },
  deps: ['bi']
};
