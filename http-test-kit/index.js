
var testApp = require('./testApp');

exports.testApp = function(options){
    return testApp(options);
};

exports.testAppBeforeAndAfter = function(testApp){
    beforeEach(function(){
        testApp.listen();        
    })    
    afterEach(function(){
        testApp.close();
    });
};