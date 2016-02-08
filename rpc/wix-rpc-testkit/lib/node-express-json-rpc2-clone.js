'use strict';

/**
 * Note: this is a copy/paste of https://www.npmjs.com/package/node-express-json-rpc2 as it seems that project is not
 * too active. Can go back to using it once https://github.com/BrianBelhumeur/node-express-json-rpc2/pull/7 is merged.
 */
module.exports = (function(){
  var PARSE_ERROR = -32700,
    INVALID_REQUEST = -32600,
    METHOD_NOT_FOUND = -32601,
    INVALID_PARAMS = -32602,
    INTERNAL_ERROR = -32603;

  var jsonrpc = function () {
    return function jsonrpc (req, res, next) {
      var requestedProcList = req.body,
        i = 0,
        reqCount, request, procList, procLen,
        isBatch = true,
        bypassSetup = false,
        requestList = {},
        responseList = [],
        /** @constant */
        //ERROR_CODES = {
        //  'PARSE_ERROR': PARSE_ERROR,
        //  'INVALID_REQUEST': INVALID_REQUEST,
        //  'METHOD_NOT_FOUND': METHOD_NOT_FOUND,
        //  'INVALID_PARAMS': INVALID_PARAMS,
        //  'INTERNAL_ERROR': INTERNAL_ERROR
        //},
        /** @constant */
        ERROR_MESSAGES = {
          '-32700': 'Parse error',
          '-32600': 'Invalid request',
          '-32601': 'Method not found',
          '-32602': 'Invalid parameters',
          '-32603': 'Internal error'
          //-32099 to -32000 are open for use
        },
        makeErrorObject = function ( params ) {
          var id, code, message, data,
            errorObj = {
              jsonrpc: '2.0'
            };

          if ( typeof params === 'object' ) {
            id = ( typeof params.id !== 'undefined' ) ? params.id : null;
            code = parseInt( params.code, 10 );
            code = ( params.code >= -32700 && params.code <= -32000 ) ? code : INTERNAL_ERROR;
            message = params.message || ERROR_MESSAGES[ code ];
            data = params.data;
          }

          errorObj.id = id;
          errorObj.error = {
            code: code,
            message: message,
            data: data
          };

          return errorObj;
        },
        /**
         * Adds the requested RPC method to a list for execution by a method handler added in the routes
         * @param {Object} procedure RPC request object with properties 'jsonrpc', 'method' and optionally 'params' and 'id'
         */
        addRequest = function ( procedure ) {
          var method = procedure.method;

          if ( typeof method !== 'string' || procedure.jsonrpc !== '2.0' ) {
            responseList.push( makeErrorObject( { code: INVALID_REQUEST, id: procedure.id } ) );
            return;
          }

          requestList[ method ] = requestList[ method ] || [];

          requestList[ method ].push( procedure );
        },
        /**
         * Specifies the request handler for a given RPC method
         * @param {String} RPC method name
         * @param {Function} Function that will be invoked with RPC request parameters (or undefined if omitted) as
         * first parameter and response function as second parameter if a response is expected
         * @public
         */
        handleRequest = function (method, handler) {
          var methodList = requestList[ method],
          // closure to remember the id of each request
            makeResponder = function( id ) {
              if ( typeof id !== 'undefined' ) {
                return function ( response ) {
                  respond( id, response );
                };
              }
            };

          if ( !Array.isArray( methodList ) ) {
            return;
          }

          delete requestList[ method ];

          // handle method queue
          /*jshint -W084 */
          while ( method = methodList.shift() ) {
            // setup response callback if response is required
            handler(
              method.params,
              makeResponder( method.id )
            );
          }
        },
        respond = function (id, responseObj) {
          var response = {}, code, message, data;

          // .result means it's a success
          // .result == null is a valid response
          if ( responseObj['result'] !== undefined ) {
            response = {
              jsonrpc: '2.0',
              id: id,
              result: responseObj.result
            };
          }
          // otherwise it's an error
          else {
            if ( typeof responseObj.error === 'object' ) {
              code = responseObj.error.code;
              message = responseObj.error.message;
              data = responseObj.error.data;
            }
            else if ( typeof ( code = parseInt( responseObj, 10 ) ) === 'number' ) {
              message = ERROR_MESSAGES[ code ];
            }
            else {
              code = INTERNAL_ERROR;
              message = ERROR_MESSAGES[ code ];
              data = responseObj;
            }

            response = makeErrorObject( { id: id, code: code, message: message, data: data } );
          }

          responseList.push( response );
        },
        handleNoRequests = function ( code ) {
          bypassSetup = true;
          responseList = [ makeErrorObject( { code: code } ) ];
          res.rpc = function () {};
        },
        sendResponse = function () {
          var finalOutput;
          var contentLength, code;

          if ( responseList.length ) {
            if ( ! isBatch ) {
              responseList = responseList[0];
            }

            finalOutput = JSON.stringify( responseList );

            // add JSONP callback if it exists
            if ( req.query && req.query.callback ) {
              finalOutput = req.query.callback + '(' + finalOutput + ');';
            }
          }

          contentLength = Buffer.byteLength( finalOutput || '');
          code = contentLength ? 200 : 204;

          res.writeHead( code,
            {
              'Content-Type': 'application/json',
              'Content-Length': contentLength
            }
          );

          res.end( finalOutput );
        },
        setup = function () {
          // single requests get put into an array for consistency
          if ( !Array.isArray( requestedProcList ) ) {
            requestedProcList = [ requestedProcList ];
            isBatch = false;
          }

          reqCount = requestedProcList.length;

          // batch request with empty array
          if ( ! reqCount ) {
            // empty array should not be treated as a batch
            isBatch = false;
            handleNoRequests( INVALID_REQUEST );
          }

          if ( ! bypassSetup ) {
            // set up procedure request list
            for ( i = 0; i < reqCount; i++ ) {
              addRequest( requestedProcList[i] );
            }
          }

          // requests are handled within routes
          next();

          // respond to unclaimed requests with a "Method not found" error
          for ( request in requestList ) {
            procList = requestList[ request ];
            procLen = procList.length;

            for ( i = 0; i < procLen; i++ ) {
              // notifications do not get ANY responses
              if ( typeof procList[i].id !== 'undefined' ) {
                respond( procList[i].id, makeErrorObject( { code: METHOD_NOT_FOUND } ) );
              }
            }
          }

          sendResponse();
        }; // end of var declarations

      // expose response handler
      res.rpc = handleRequest;

      // make sure we are actually handling a JSON-RPC request
      if ( req.headers['content-type'] && req.headers['content-type'].indexOf( 'application/json' ) > -1 ) {
        // nothing in req.body
        if ( typeof requestedProcList === 'undefined' ) {
          var buf = '';

          if ( req.originalUrl.indexOf( '?' ) > -1 ) {
            try {
              requestedProcList = JSON.parse( decodeURIComponent( req.originalUrl.substr( req.originalUrl.indexOf( '?' ) + 1 ) ) );
            } catch (e) {
              handleNoRequests( PARSE_ERROR );
            }

            setup();
          } else {
            req.setEncoding( 'utf8' );
            req.on( 'data', function (chunk) { buf += chunk; } );
            req.on( 'end', function () {
              try {
                requestedProcList = req.body = JSON.parse( buf );
              } catch (e) {
                handleNoRequests( PARSE_ERROR );
              }

              setup();
            });
          }

        } else {
          setup();
        }
      } else {
        // not a JSON-RPC request
        next();
      }
    };
  };

  jsonrpc.PARSE_ERROR = PARSE_ERROR,
    jsonrpc.INVALID_REQUEST = INVALID_REQUEST,
    jsonrpc.METHOD_NOT_FOUND = METHOD_NOT_FOUND,
    jsonrpc.INVALID_PARAMS = INVALID_PARAMS,
    jsonrpc.INTERNAL_ERROR = INTERNAL_ERROR;

  return jsonrpc;
}());