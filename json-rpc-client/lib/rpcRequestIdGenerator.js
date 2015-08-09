var Chance = require('chance');
var chance = new Chance();


module.exports = function(){
    return chance.integer();
};