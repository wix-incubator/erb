'use strict';
const expect = require('chai').expect,
  shelljs = require('shelljs'),
  emitter = require('..'),
  intercept = require('intercept-stdout');

describe('wix-config-emitter', () => {
  let stdout, detach;

    beforeEach(() => {
      shelljs.rm('-rf', './test/configs');
      shelljs.rm('-rf', './target/configs');
      stdout = '';
      detach = intercept(txt => {
        stdout += txt;
      });
    });

  afterEach(() => detach());

    it('should take configs from "/templates" and write to "/test/configs/" by default', () =>
      emitter()
        .fn('title', 1, 'One Chicken Fried Steak')
        .val('additions', 'with pattie, breaded and fried')
        .emit()
        .then(() => {
          expect(shelljs.cat('./test/configs/test-config.txt'))
            .to.equal('Morty had One Chicken Fried Steak with pattie, breaded and fried.');
        })
    );

    it('should process multiple configs from single source folder', () =>
      emitter({
        sourceFolders: ['./test/test-configs/multi'],
        targetFolder: './test/configs/multi'
      })
        .fn('title', 1, 'One Chicken Fried Steak')
        .fn('title', 2, 'Gazillion Chicken Fried Steak')
        .val('additions', 'with pattie, breaded and fried')
        .emit()
        .then(() => {
          expect(shelljs.cat('./test/configs/multi/first.txt'))
            .to.equal('Morty had One Chicken Fried Steak with pattie, breaded and fried.');
          expect(shelljs.cat('./test/configs/multi/second.txt'))
            .to.equal('Morty had Gazillion Chicken Fried Steak with pattie, breaded and fried.');
        })
    );

    it('should process multiple configs from multiple source folders', () =>
      emitter({
        sourceFolders: ['./test/test-configs/multi', './templates'],
        targetFolder: './test/configs/multi-folders'
      })
        .fn('title', 1, 'One Chicken Fried Steak')
        .fn('title', 2, 'Gazillion Chicken Fried Steak')
        .val('additions', 'with pattie, breaded and fried')
        .emit()
        .then(() => {
          expect(shelljs.cat('./test/configs/multi-folders/first.txt'))
            .to.equal('Morty had One Chicken Fried Steak with pattie, breaded and fried.');
          expect(shelljs.cat('./test/configs/multi-folders/second.txt'))
            .to.equal('Morty had Gazillion Chicken Fried Steak with pattie, breaded and fried.');
          expect(shelljs.cat('./test/configs/multi-folders/test-config.txt'))
            .to.equal('Morty had One Chicken Fried Steak with pattie, breaded and fried.');
        })
    );

    it('should replace "fn" declarations with same name and arguments on subsequent invocations', () =>
      emitter()
        .fn('title', 1, 'One Chicken Fried Steak')
        .fn('title', 1, 'Two Chicken Fried Steak')
        .val('additions', 'with pattie, breaded and fried')
        .emit()
        .then(() => {
          expect(shelljs.cat('./test/configs/test-config.txt'))
            .to.equal('Morty had Two Chicken Fried Steak with pattie, breaded and fried.');
        })
    );

    it('should clear target folder before rendering configs there', () => {
      shelljs.mkdir('-p', './test/configs/');
      shelljs.echo('').to('./test/configs/been-here-before.txt');
      return emitter({
        sourceFolders: ['./templates'],
        targetFolder: './test/configs/'
      })
        .fn('title', 1, 'One Chicken Fried Steak')
        .val('additions', 'with pattie, breaded and fried')
        .emit()
        .then(() => {
          expect(shelljs.cat('./test/configs/test-config.txt'))
            .to.equal('Morty had One Chicken Fried Steak with pattie, breaded and fried.');
          expect(shelljs.test('-f', './test/configs/been-here-before.txt')).to.be.false;
        });
    });

    it('should use only last "val" declaration with same name for substitution', () =>
      emitter()
        .fn('title', 1, 'One Chicken Fried Steak')
        .val('additions', 'with pattie, breaded and fried')
        .val('additions', 'with pattie')
        .emit()
        .then(() => {
          expect(shelljs.cat('./test/configs/test-config.txt'))
            .to.equal('Morty had One Chicken Fried Steak with pattie.');
        })
    );

    it('should not fail on non-existent source folders but instead log a warning', () =>
      emitter({
        sourceFolders: ['./templates', './qwe'],
        targetFolder: './test/configs/'
      })
        .fn('title', 1, 'One Chicken Fried Steak')
        .val('additions', 'with pattie, breaded and fried')
        .emit()
        .then(() => {
          expect(shelljs.cat('./test/configs/test-config.txt'))
            .to.equal('Morty had One Chicken Fried Steak with pattie, breaded and fried.');
          expect(stdout).to.be.string('Source config folder ./qwe does not exist or is not accessible');
        })
    );
});