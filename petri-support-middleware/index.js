var _ = require('lodash');

exports.init = function(app){
    app.use(require('cookie-parser')());
    app.use(middleware());
};

var middleware = function () {
    return function (req, res, next) {
        var domain = require('wix-node-domain').wixDomain();
        var cookies = {};
        for (var key in req.cookies) {
            if(_.startsWith(key, "_wixAB3"))
                cookies[key] = req.cookies[key]
        }
        domain.petriCookies = cookies;
        next();
    };
};
