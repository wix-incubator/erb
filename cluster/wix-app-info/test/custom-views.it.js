'use strict';
const expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  appInfo = require('..'),
  get = require('./test-utils');

describe('custom views', () => {
  const server = aServer({
    views: [cutomViewApiOnly(), cutomViewHtmlOnly(), cutomViewHtmlAndApi()]
  });

  server.beforeAndAfter();

  describe('json only', () => {
    it('should respond with json given Accept header other than "html"', () =>
      get.jsonSuccess(server.getUrl('api-only')).then(json =>
        expect(json).to.have.deep.property('anItemName', 'customViewApiOnly')
      )
    );

    it('should not render html view', () =>
      get.html(server.getUrl('api-only')).then(res => expect(res.status).to.equal(404))
    );
  });

  describe('html only', () => {

    it('should not serve json api', () =>
      get.json(server.getUrl('html-only')).then(res => expect(res.status).to.equal(404))
    );

    it('should render html view', () =>
      get.htmlSuccess(server.getUrl('html-only')).then(html =>
        expect(html).to.contain('anItemName', 'customViewHtmlOnly')
      )
    );
  });

  describe('both html and json', () => {

    it('should respond with json given Accept header other than "html"', () =>
      get.jsonSuccess(server.getUrl('html-and-api')).then(json =>
        expect(json).to.have.deep.property('anItemName', 'cutomViewHtmlAndApi')
      )
    );

    it('should render html view', () =>
      get.htmlSuccess(server.getUrl('html-and-api')).then(html =>
        expect(html).to.contain('anItemName', 'cutomViewHtmlAndApi')
      )
    );
  });

  function aServer(opts) {
    const server = testkit.server();
    server.getApp().use(appInfo(opts));
    return server;
  }
});

function cutomViewApiOnly() {
  class CustomApi extends appInfo.views.AppInfoView {
    api() {
      return Promise.resolve({anItemName: 'customViewApiOnly'});
    }
  }

  return new CustomApi({
    mountPath: '/api-only'
  });
}

function cutomViewHtmlOnly() {
  class CustomHtml extends appInfo.views.AppInfoView {
    view() {
      return Promise.resolve({items: [appInfo.views.item('anItemName', 'customViewHtmlOnly')]});
    }
  }

  return new CustomHtml({
    mountPath: '/html-only',
    title: 'HtmlOnly',
    template: 'single-column'
  });
}

function cutomViewHtmlAndApi() {
  class CustomHtmlAndApi extends appInfo.views.AppInfoView {
    api() {
      return Promise.resolve({anItemName: 'cutomViewHtmlAndApi'});
    }

    view() {
      return Promise.resolve({items: [appInfo.views.item('anItemName', 'cutomViewHtmlAndApi')]});
    }
  }

  return new CustomHtmlAndApi({
    mountPath: '/html-and-api',
    title: 'HtmlAndApi',
    template: 'single-column'
  });
}
