var cookieParser = require('cookie-parser');
var wixDomain = require('wix-node-domain');
var cookiesUtil = require('cookies-utils')();


/**
 * *
 * @param options
 * @returns {{middleware: middleware, session: session}}
 */
module.exports = function (options) {
    var wixSession = require('wix-session')(options);
    return {        
        middleware: function(){
            return middleware(wixSession);                    
        },
        session: function(){
            return wixDomain.wixDomain().wixSession            
        }
    };    
        
};

var middleware =  function (wixSession) {
    return function (req, res, next) {
        var cookies = cookiesUtil.toDomain(req.headers['cookie']);
        if (!cookies.wixSession) {
            res.statusCode = 401;
            res.end('Banned');
        }
        else {
            var session = wixSession.fromStringToken(cookies.wixSession);
            if (!(session.isError)) {
                wixDomain.wixDomain().wixSession = session;
                next();
            } else {
                res.statusCode = 401;
                res.end('Banned');
            }
        }
    }
};
