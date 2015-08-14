var _ = require('lodash');

/**
 * * 
 * @param contexts object with petriContext, biContext, webContext
 * @returns {{addSupportTo: addSupportTo}}
 */
module.exports = function (contexts) {
    return {
        addSupportTo: function (rpcClient) {
            rpcClient.registerHeaderBuildingHook(function (req) {
                    req.blabla = 'xxx';
            });
            return 0;
        }
    };
};




