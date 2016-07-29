# aspects

Aspects represent storage for request-scoped data extracted from headers, query params, cookies for usage within app. Aspect modules themselves are decoupled from web framework and can be plugged to any web framework (and not only) with a help of adapter module.

There are core modules for:
 - adapter for expressjs - [wix-express-aspects](wix-express-aspects);
 - wix-[name]-aspect - part of aspect store fulfilling some role - bi, session, petri...
