var signer = require('./signer');



exports.sign = function(requestBuffer, timeInMillis, key){
    var signature = signer.sign([requestBuffer.slice(0, 1024), timeInMillis], key);
    return {headerName: 'X-Wix-Signature', headerValue: signature + ";" + timeInMillis}
}