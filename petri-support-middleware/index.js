
exports.init = function(app){
    app.use(require('cookie-parser')());
    app.use(require('wix-node-domain').wixDomainMiddleware());
};

exports.read = function () {
    return function (req, res, next) {
        var domain = require('wix-node-domain').wixDomain();
        var cookies = {};
        for (var key in req.cookies) {
            if(key.substring(0,7) === ("_wixAB3"))
                cookies[key] = req.cookies[key]
        }
        domain.petriCookies = cookies;
        next();
    };
};
