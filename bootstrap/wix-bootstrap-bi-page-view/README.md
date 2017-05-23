# wix-bootstrap-bi-page-view
A [wix-bootstrap-ng](../wix-bootstrap-ng) plugin that provides you with express.js middleware, used for reporting anonymous
user page view events (1000 & 1001).
This plugin requires [wix-bootstrap-bi](../wix-bootstrap-bi) plugin to be enabled.


## install

```bash
npm install --save wix-bootstrap-bi-page-view
```

## usage
_index.js_
```js
require('wix-bootstrap-ng')()
  .use(require('wix-bootstrap-bi')) // required
  .use(require('wix-bootstrap-bi-page-view'))
  .express('./lib/express-app')
  .start();

```

_lib/express-app.js_
```js
module.exports = (app, context) => {
  
  // flavour 1 - via method call
  app.get('/page-view', context.pageView.middleware(), (req, res) => {
    context.pageView.report(req, res);
    res.render('my-view');
  });
  
  // flavour 2 - via res.render() callback
  app.get('/page-view', context.pageView.middleware(), (req, res) => {
    res.render('my-view', context.pageView.onRender(req, res));
  });
  
  return app;
};

```

## api

###context.pageView.middleware() 
Returns an instance of page view express middleware, responsible for 
setting up [wix-bi-aspect](../../aspects/wix-bi-aspect) properly.


###context.pageView.report(req, res): Promise
Reports appropriate BI event (1000/1001) and sets up BI cookies on response.

###context.pageView.onRender(req, res)
A callback to be used with [express.js Response#render](https://expressjs.com/en/api.html#res.render).
Reports appropriate BI event (1000/1001) and sets up BI cookies on response.




