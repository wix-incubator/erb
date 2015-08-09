/**
 * *
 * @param _ lodash
 */
module.exports = function(_) {
    _.mixin({
        defaultsDeep: require('defaults-deep-safe'),
        emptyIfNull: function(obj){
            if(!obj) return {};
            else return obj;
        }
    });
};