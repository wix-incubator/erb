# wix-error-pages

Module that renders html with generic with error template.

## install

```bash
npm install --save wix-error-pages
```

## usage

```js
const wixErrorPages = require('wix-error-pages'),
  express = require('express'),
  wixExpressAspects = require('wix-express-aspects'),
  wixWebContextAspect = require('wix-web-context-aspect');

const render = wixErrorPages('http://public-static-url'); //create renderer with location to statics.

const app = express();
  app.use(wixExpressAspects.get([wixWebContextAspect.builder()])); // needs web-context aspect
  app.get('/fails', (req, res, next) => next(new Error('woops')));
  app.use((err, req, res, next) => {
    res.status(500).send(render(req, 500, -100)); // will render html with common wix error view.
  });

app.listen(3000);
```
## Api

### wixPublicStaticsUrl => (req, httpStatusCode, errorPageCode): String

Given wix public static url, returns a renderer function that given arguments:
 - req - `express` request with `web-context` aspect;
 - httpStatusCode - http status code which which request is terminated;
 - errorPageCode - internal error code emitted by app;

and returns an rendered html page as string.
