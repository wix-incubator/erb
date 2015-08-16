var _ = require('lodash'),
    cookiesUtil = require('cookies-utils');
var wixDomainModule = require('wix-node-domain');

exports.middleware = function () {
    return function (req, res, next) {
        var domain = wixDomainModule.wixDomain();
        var cookies = {};
        var reqCookies = cookiesUtil.toDomain(req.headers['cookie']);

        Object.keys(reqCookies).map(function (key) {
            if (_.startsWith(key, "_wixAB3"))
                cookies[key] = reqCookies[key];
        });
        domain.petriCookies = cookies;
        next();
    };
};


