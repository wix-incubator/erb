console.log('****************************************************************************');
console.log('* wix-bootstrap-rpc is DEPRECATED                                          *');
console.log('*                                                                          *');
console.log('* remove it from your index.js - as .use(require(\'wix-bootstrap-rpc\'))   *');
console.log('* and as dependency \'wix-bootstrap-rpc\' from package.json                *');
console.log('*                                                                          *');
console.log('****************************************************************************');
module.exports.di = {
  key: '_rpc_deprecated',
  value: () => {},
  bind: false
};
