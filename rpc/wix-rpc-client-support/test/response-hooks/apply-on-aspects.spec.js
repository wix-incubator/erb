const {expect} = require('chai'),
  enrich = require('../../lib/response-hooks/apply-on-aspects').get();

describe('apply-on-aspects response hook', () => {

  it('should invoke aspects within context providing headers and cookies', () => {
    const store = aspectStore();
    const reqData = {
      h1: 'h1Val1',
      'set-cookie': 'some=another'
    };

    enrich(reqData, store);

    expect(store.imports).to.deep.equal([
      {
        headers: {
          h1: 'h1Val1',
          'set-cookie': 'some=another'
        },
        cookies: {
          some: 'another'
        }
      }
    ]);
  });

  it('should be safe to invoke with no aspects', () => {
    enrich({}, {});
  });

  it('should be safe to invoke with no aspect store', () => {
    enrich({});
  });

  function aspectStore() {
    const imports = [];
    return {
      imports,
      'with-import': {
        name: 'with-import',
        import: resData => imports.push(resData)
      },
      'without-import': {
        name: 'without-import'
      }
    };
  }
});
