'use strict';
exports.rpcStub = function () {
  var self = this;
  this.functions = [];
  this.registerHeaderBuildingHook = function (f) {
    this.functions.push(f);
  };

  this.headers = {};
  this.jsonBuffer = {};


  this.invoke = function () {
    this.functions.forEach(function (f) {
      f(self.headers, self.jsonBuffer);
    });
  };
};