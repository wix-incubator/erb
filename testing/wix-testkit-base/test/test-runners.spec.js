'use strict';
const expect = require('chai').expect,
  childProcess = require('child_process');

describe('test runners', function() {
  this.timeout(20000);

  describe('wix-testkit-base before*() shorthands should be supported in', () => {

    it('mocha', () => {
      const res = execMocha('before-after-helpers-ok.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('3 passing');
    });

    it('jasmine', () => {
      const res = execJasmine('before-after-helpers-ok.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('3 specs, 0 failures');
    });
  });

  describe('wix-testkit-base beforeAndAfter*() start failure should be detected in', () => {

    it('mocha', () => {
      const res = execMocha('before-after-helpers-start-fail.spec.js');
      expect(res.ok).to.be.false;
      expect(res.out).to.be.string('wix-testkit-base beforeAndAfter start fail "before all" hook');
      expect(res.out).to.be.string('wix-testkit-base beforeAndAfterEach start fail "before each" hook');
      expect(res.out).to.be.string('4 failing');
      expect(res.out).to.be.string('0 passing');
    });

    it('jasmine', () => {
      const res = execJasmine('before-after-helpers-start-fail.spec.js');
      expect(res.ok).to.be.false;
      expect(res.out).to.be.string('Failed: start failed');
      expect(res.out).to.be.string('3 specs, 4 failures');
    });
  });

  describe('wix-testkit-base beforeAndAfter*() stop failure should be detected in', () => {

    it('mocha', () => {
      const res = execMocha('before-after-helpers-stop-fail.spec.js');
      expect(res.ok).to.be.false;
      expect(res.out).to.be.string('wix-testkit-base beforeAndAfter stop fail "after all" hook');
      expect(res.out).to.be.string('wix-testkit-base beforeAndAfterEach stop fail "after each" hook');
      expect(res.out).to.be.string('2 failing');
      expect(res.out).to.be.string('2 passing');
    });

    it('jasmine', () => {
      const res = execJasmine('before-after-helpers-stop-fail.spec.js');
      expect(res.ok).to.be.false;
      expect(res.out).to.be.string('Failed: service was already started');
      expect(res.out).to.be.string('Error: stop failed');
      expect(res.out).to.be.string('3 specs, 3 failures');
    });
  });

  describe('wix-testkit-base beforeAndAfter*() with explicit delay in', () => {

    it('mocha', () => {
      const res = execMocha('before-after-helpers-explicit-delay.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('3 passing');
    });

    it('jasmine', () => {
      const res = execJasmine('before-after-helpers-explicit-delay.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('3 specs, 0 failures');
    });
  });

  describe('wix-testkit-base beforeAndAfter*() with explicit delay outside of describe in', () => {

    it('mocha beforeAndAfter', () => {
      const res = execMocha('before-after-global-explicit-delay.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('2 passing');
    });

    it('mocha beforeAndAfterEach', () => {
      const res = execMocha('before-after-each-global-explicit-delay.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('2 passing');
    });

    it('jasmine beforeAndAfter', () => {
      const res = execJasmine('before-after-global-explicit-delay.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('2 specs, 0 failures');
    });

    it('jasmine beforeAndAfterEach', () => {
      const res = execJasmine('before-after-each-global-explicit-delay.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('2 specs, 0 failures');
    });
  });

  describe('wix-testkit-base start/stop should be supported in', () => {

    it('mocha', () => {
      const res = execMocha('start-stop-ok.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('2 passing');
    });

    it('jasmine', () => {
      const res = execJasmine('start-stop-ok.spec.js');
      expect(res.ok).to.be.true;
      expect(res.out).to.be.string('1 spec, 0 failures');
    });
  });

  describe('wix-testkit-base start failure should be detected in', () => {

    it('mocha', () => {
      const res = execMocha('start-fail.spec.js');
      expect(res.ok).to.be.false;
      expect(res.out).to.be.string('Error: start failed');
      expect(res.out).to.be.string('0 passing');
      expect(res.out).to.be.string('2 failing');
    });

    it('jasmine', () => {
      const res = execJasmine('start-fail.spec.js');
      expect(res.ok).to.be.false;
      expect(res.out).to.be.string('Failed: start failed');
      expect(res.out).to.be.string('1 spec, 1 failure');
    });
  });

  describe('wix-testkit-base stop failure should be detected in', () => {

    it('mocha', () => {
      const res = execMocha('stop-fail.spec.js');
      expect(res.ok).to.be.false;
      expect(res.out).to.be.string('wix-testkit-base stop with callbacks fails "after all" hook');
      expect(res.out).to.be.string('wix-testkit-base stop with promises fails "after all" hook');
      expect(res.out).to.be.string('2 passing');
      expect(res.out).to.be.string('2 failing');
    });

    it('jasmine', () => {
      const res = execJasmine('stop-fail.spec.js');
      expect(res.ok).to.be.false;
      expect(res.out).to.be.string('An error was thrown in an afterAll');
      expect(res.out).to.be.string('1 spec, 1 failure');
    });
  });

  function exec(cmd) {
    try {
      return {
        ok: true,
        out: childProcess.execSync(cmd).toString()
      };
    } catch (e) {
      const out = e.stdout.toString() + e.stderr.toString();
      return {
        ok: false,
        out: out
      };
    }
  }

  function execMocha(spec) {
    return exec(`./node_modules/.bin/mocha ./test/external-mocha/${spec}`);
  }

  function execJasmine(spec) {
    return exec(`./node_modules/.bin/jasmine JASMINE_CONFIG_PATH=test/external-jasmine/jasmine.json test/external-jasmine/${spec}`);
  }
});

