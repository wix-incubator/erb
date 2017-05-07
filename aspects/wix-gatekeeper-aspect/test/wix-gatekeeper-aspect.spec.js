const expect = require('chai').expect,
  builder = require('..').builder();

describe('WixGatekeeperAspect', () => {
  
  it('has proper name', () => {
    expect(builder({}).name).to.equal('gatekeeper');
  });
  
  it('is not authorized initially', () => {
    const aspect = builder({});
    expect(aspect.authorized).to.equal(false);
    expect(aspect.context).to.be.undefined;
  });
  
  it('is authorized after authorization', () => {
    const aspect = builder({});
    const context = {user: 'some-user', roles: ['some-role']};
    aspect.authorize(context);

    expect(aspect.authorized).to.equal(true);
    expect(aspect.context).to.deep.equal(context);
  });
});
