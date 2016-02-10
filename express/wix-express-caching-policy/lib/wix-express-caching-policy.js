'use strict';

module.exports.withStrategy = strategy => (req,res, next) => next();
module.exports.strategyBuilder = () => new StrategyBuilder();
module.exports.strategyTypes = () => types;

class StrategyBuilder{
  constructor(){
  }

  withType(type){
    this.type = type;
    return this;
  }

  withAge(age){
    this.age = age;
    return this;
  }
}

var types = {
  noHeaders: 0,
  infinite: 1,
  specificAge: 2,
  maxAge: 3
};

