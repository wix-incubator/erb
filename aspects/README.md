# aspects

Aspects represent storage for request-scoped data extracted from headers, query params, cookies for usage within app.
  
Each aspect is built-up of at least 2 modules:
 - wix-[aspect] - actual immutable storage unit for usage within app;
 - wix-[express]-[aspect] - middleware for populating `wix-[aspect]` with relevant data. `[express]` represents http://expressjs.com/ web framework which we target, but given another web framework is supported, corresponding middleware should be produced.