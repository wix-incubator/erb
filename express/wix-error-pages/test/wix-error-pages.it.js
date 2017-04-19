const {expect} = require('chai');
const wixErrorPages = require('..'),
  httpTestkit = require('wix-http-testkit'),
  wixExpressAspects = require('wix-express-aspects'),
  wixWebContextAspect = require('wix-web-context-aspect'),
  http = require('wnp-http-test-client');

describe('error page renderer', () => {
  const wixPublicStaticsUrl = '//static.parastorage.com/services/wix-public/1.209.0';
  const server = httpTestkit.server().beforeAndAfter();
  server.getApp().use(wixExpressAspects.get([wixWebContextAspect.builder()]));
  server.getApp().get('/fails', (req, res, next) => next(new Error('woops')));
  server.getApp().use((err, req, res, next) => {
    res.status(500).send(wixErrorPages(wixPublicStaticsUrl)(req, 500, -100));
    next();
  });

  it('should render error page with data from aspect store', () => {
    return http(server.getUrl('fails?overrideLocale=it')).then(res => {
      const html = res.text();
      expect(html).to.contain('.constant(\'baseDomain\', \'.wix.com\')');
      expect(html).to.contain('.constant(\'language\', \'it\');');
    });
  });

  it('should infer debug from aspect store', () => {
    return Promise.all([
      http(server.getUrl('fails?debug')),
      http(server.getUrl('fails'))
    ]).then(([withDebug, withoutDebug]) => {
      expect(withDebug.text()).to.contain('_debug_styles/error-pages/main.css');
      expect(withDebug.text()).to.not.contain('styles/error-pages/styles.css');

      expect(withoutDebug.text()).to.not.contain('_debug_styles/error-pages/main.css');
      expect(withoutDebug.text()).to.contain('styles/error-pages/styles.css');
    });
  });
});
