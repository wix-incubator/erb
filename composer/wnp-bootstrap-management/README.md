# wnp-bootstrap-management

Management app container, plugged-in by default to [wnp-bootstrap-composer](../wnp-bootstrap-composer) and serves '/app-info'([wix-app-info](../../cluster/wix-app-info)) as well as provided express apps/routers.

## api

### (appName, appVersion, persistentDir) => ...appFns => express
Returns a function that accepts a list of functions `express => Promise(express)` that returns a composed express app.

Parameters:
 - appName: name of app;
 - appVersion: version of app;
 - persistentDir: directory to store files (ex. heap dumps);