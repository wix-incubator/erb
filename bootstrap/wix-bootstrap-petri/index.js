console.log('****************************************************************************');
console.log('* wix-bootstrap-petri is DEPRECATED                                        *');
console.log('*                                                                          *');
console.log('* remove it from your index.js - as .use(require(\'wix-bootstrap-petri\')) *');
console.log('* and as dependency \'wix-bootstrap-petri\' from package.json              *');
console.log('*                                                                          *');
console.log('****************************************************************************');
module.exports.di = {
  key: '_petri_deprecated',
  value: () => {},
  bind: false
};
