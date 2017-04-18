const expect = require('chai').expect;
const decipher = require('../lib/decipher');

describe('Decipher', () => {
  
  it('should decipher an encrypted text to a json object', () => {
    const parsed = decipher(
      'ULLqKq27psk2bz4GEeMifHAZThzR7wCfcYLQAZYbhz+a+ANf+fiWwvCPUXxsGoIfV+3haWfjZUIzOaidjVu7b/j0Wo6hVdKHwtqKPPuYdUE=',
      'initialization12' // from https://github.com/wix-private/wix-bo-auth/blob/master/wix-bo-authentication-config/src/main/scala/com/wix/auth/spring/BoAuthenticationConfiguration.scala
    );
    
    expect(parsed).to.eql({
      accessToken: '123',
      displayName: 'u',
      email: 'm@wix.com',
      imageUrl: ''
    });
  });
});
