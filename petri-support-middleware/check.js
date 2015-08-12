var _ = require('lodash');

var x = function(y){
    return 4;    
};


var z = function(z){
    return 7;
};


console.log(_.isEqual(z,z));
