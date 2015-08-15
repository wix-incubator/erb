var _ = require('lodash'),
    cookiesUtil = require('cookies-utils')();

exports.init = function(app){
    app.use(middleware());
};


var middleware = function () {
    return function (req, res, next) {
        var domain = require('wix-node-domain').wixDomain();
        var cookies = {};
        var reqCookies = cookiesUtil.toDomain(req.headers['cookie']);

        Object.keys(reqCookies).map(function(key){
            if(_.startsWith(key, "_wixAB3"))
                cookies[key] = reqCookies[key];
        });
        domain.petriCookies = cookies;
        next();
    };
};
