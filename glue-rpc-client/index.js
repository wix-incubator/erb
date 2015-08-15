var _ = require('lodash');

/**
 * *
 * @param contexts object with petriContext, biContext, webContext
 * @returns {{addSupportTo: addSupportTo}}
 */
module.exports = function (contexts) {
    return {
        addSupportTo: function (rpcClient) {
            rpcClient.registerHeaderBuildingHook(function (headers) {
                headers['x-wix-request-id'] = contexts.webContext.requestId
            });

            // Add more headers
            // Add cookies

            // rpcClient.registerWriteCookiesHook(cookies);  (cookies)=> Save to domain and to response
        }
    };
};




