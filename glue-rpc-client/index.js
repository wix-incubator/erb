var _ = require('lodash');



/**
 * mixes in the glue functionality to an RPC client
 * - web context
 * @param options - object with webContextService
 */
module.exports = function RpcClientMixin(rpcClient, options) {

  if (options.webContextService) {
    rpcClient.registerHeaderBuildingHook(function (headers) {
      headers['x-wix-request-id'] = options.webContextService.webContext().requestId
    });
  }

  // Add more headers
  // Add cookies

  // rpcClient.registerWriteCookiesHook(cookies);  (cookies)=> Save to domain and to response

};


