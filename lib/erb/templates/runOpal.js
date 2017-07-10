/* eslint-disable */

__OPAL__

eval(global.Opal.Opal.ERB.$compile(new Buffer('__TEMPLATE__', 'base64').toString('utf8'), 'mytemplate'));
output = global.Opal.Template['$[]']('mytemplate').$render();
/* eslint-enable */
