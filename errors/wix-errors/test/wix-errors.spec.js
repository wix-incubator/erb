const {WixBaseError, WixError, HttpStatus, ErrorCode} = require('..'),
  expect = require('chai').expect;

describe('wix-errors.js', () => {
  
  describe('WixBaseError class constructor', () => {

    const CustomErrorCode = 666;
    class MyDomainError extends WixBaseError(CustomErrorCode, HttpStatus.NOT_FOUND) {

      constructor(msg, cause) {
        super(msg, cause);
      }
    }

    it('should create a class that is an instance of error', () => {
      expect(new MyDomainError('woof')).to.be.instanceof(Error);
    });

    it('should have message', () => {
      expect(new MyDomainError('woof')).to.have.property('message', 'woof');
    });

    it('should have cause', () => {
      const cause = new Error('cause');
      expect(new MyDomainError('woof', cause)).to.have.property('cause', cause);
    });

    it('should have proper name', () => {
      expect(new MyDomainError('woof')).to.have.property('name', 'MyDomainError');
    });

    it('should have errorCode', () => {
      expect(new MyDomainError('woof')).to.have.property('errorCode', CustomErrorCode);
    });

    it('should have httpStatusCode', () => {
      expect(new MyDomainError('woof')).to.have.property('httpStatusCode', HttpStatus.NOT_FOUND);
    });

    it('should not have WixBaseError in stack trace', () => {
      expect(new MyDomainError('woof').stack).not.to.have.string('wix-errors.js');
    });

    it('should allow valid message only', () => {
      expect(() => new MyDomainError()).to.throw(/message.*mandatory/);
      expect(() => new MyDomainError(1)).to.throw(/message.*mandatory/);
    });

    it('should have HTTP status INTERNAL_SERVER_ERROR if not provided', () => {
      expect(new (WixBaseError())('woof')).to.have.property('httpStatusCode', HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should have error code -100 UNKNOWN if not provided', () => {
      expect(new (WixBaseError())('woof')).to.have.property('errorCode', ErrorCode.UNKNOWN);
    });

    it('should accept valid integer as errorCode', () => {
      expect(() => new (WixBaseError('not-an-inteher'))('woof')).to.throw(/errorCode.*integer/);
    });

    it('should accept valid HTTP status code', () => {
      const httpStatusOutOfRange = 1200;
      expect(() => new (WixBaseError(-100, 'not-an-integer'))('woof')).to.throw(/HTTP.*status.*valid/);
      expect(() => new (WixBaseError(-100, httpStatusOutOfRange))('woof')).to.throw(/HTTP.*status.*valid/);
    });

    it('should have cause in the stack trace', () => {
      const cause = new Error('cause');
      const stack = new MyDomainError('woof', cause).stack;
      console.log(stack);
      expect(stack).to.match(/MyDomainError.*woof[\s\S]*Caused By.*Error.*cause/);
    });
    
    it('should accept instance of Error for cause', () => {
      expect(() => new MyDomainError('woof', 'not-an-error')).to.throw(/cause.*Error/);
    });
  });
  
  describe('WixError class', () => {
    
    it('should have error code -100', () => {
      expect(new WixError('woof')).to.have.property('errorCode', ErrorCode.UNKNOWN); 
    });
    
    it('should have httpStatusCode INTERNAL_SERVER_ERROR', () => {
      expect(new WixError('woof')).to.have.property('httpStatusCode', HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
