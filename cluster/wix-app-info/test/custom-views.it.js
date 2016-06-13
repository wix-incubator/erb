'use strict';
const expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  appInfo = require('..'),
  get = require('./test-utils'),
  Router = require('express').Router;

describe('custom views', () => {
  const server = aServer({
    views: [cutomView()],
    heapDumpTempDir: './target/heapdump'
  });

  server.beforeAndAfter();

  describe('plugin', () => {

    it('should respond with json', () =>
      get.jsonSuccess(server.getUrl('html-and-api/api')).then(json =>
        expect(json).to.have.deep.property('anItemName', 'customViewApi')
      )
    );

    it('should render html', () =>
      get.htmlSuccess(server.getUrl('html-and-api')).then(html =>
        expect(html).to.contain('anItemName', 'customViewHtml')
      )
    );
  });

  function aServer(opts) {
    const server = testkit.server();
    server.getApp().use(appInfo(opts));
    return server;
  }
});


function cutomView() {
  class CustomHtmlAndApi extends appInfo.views.AppInfoView {
    api() {
      const router = new Router();
      return router.get('/', (req, res) => {
        res.json({anItemName: 'customViewApi'})
      });
    }

    view() {
      return Promise.resolve({items: [appInfo.views.item('anItemName', 'customViewHtml')]});
    }
  }

  return new CustomHtmlAndApi({
    mountPath: '/html-and-api',
    title: 'HtmlAndApi',
    template: 'single-column'
  });
}
