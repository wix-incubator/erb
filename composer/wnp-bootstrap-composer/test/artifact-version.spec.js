'use strict';
const expect = require('chai').expect,
  fs = require('fs'),
  join = require('path').join,
  os = require('os'),
  artifactVersion = require('../lib/artifact-version'),
  stdOutErrTestkit = require('wix-stdouterr-testkit');

describe('artifact version', () => {
  const cwd = os.tmpdir();
  const interceptor = stdOutErrTestkit.interceptor().beforeAndAfterEach();

  beforeEach(() => {
    try {
      fs.unlinkSync(join(cwd, 'ver'));
    } catch(e) {}
  }
);

  it('should set to "-" given "ver" file is missing', () => {
    expect(artifactVersion(cwd)).to.equal('-');
    expect(interceptor.output).to.be.string('will not load artifact version');
  });

  it('should return a version defined in "ver" file on cwd', () => {
    givenAVersionFile('1.0.0');

    expect(artifactVersion(cwd)).to.equal('1.0.0');
  });

  function givenAVersionFile(str) {
    fs.writeFileSync(join(cwd, 'ver'), str);
  }
});

