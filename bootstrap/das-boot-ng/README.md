# das-boot-ng

Template deployable to production app showing capabilities and features of a [wix-bootstrap](../wix-bootstrap-ng) together with:
 - config templates `./templates/*.erb` and config generator for tests `./test/environment.js` using [wix-config-emitter](../../config/wix-config-emitter);
 - [rpc plugin](../wix-bootstrap-rpc) used in `./index.js` and wired-in in `./lib/config.js` together with [rpc testkit](../../rpc/wix-rpc-testkit) - `./test/environment.js`;
 - [bi plugin](../wix-bootstrap-bi) used in `./index.js` and wired-in in `./lib/config.js` together with [bi testkit](../../bi/wix-bi-node-testkit) - `./test/environment.js`;
 - [express](http://expressjs.com/) app (`./lib/express-app.js`) with tests `./test/express-app.spec.js`;
 - support files for ci/deployment: `pom.xml`, `.nvmrc`, `Dockerfile`, `.dockerignore`, `.npmignore`;

You can clone this app and use as a boilerplate, just don't forget to read [docs](..) and clean/change:
 - module name and author in `package.json`, pom.xml;
 - author in `Dockerfile`;
 
Have fun yo!
