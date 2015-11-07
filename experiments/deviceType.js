const parser = require('ua-parser-js');
const assert = require('assert');
const chrome = parser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/535.20 (KHTML, like Gecko) Chrome/19.0.1036.7 Safari/535.20');

assert(chrome.browser.name == 'Chrome');

const googleBot = parser('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)');

// Not good, does not recognised bots :/ 
assert(googleBot.browser.name == undefined);

