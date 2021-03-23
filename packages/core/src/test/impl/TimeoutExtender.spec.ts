
import {TimeoutExtender} from '../../impl/TimeoutExtender';
import {SquissStub} from '../stubs/SquissStub';
import delay from 'delay';
// @ts-ignore
import * as sinon from 'sinon';
import {S3Stub} from '../stubs/S3Stub';
import {testMessageGzip} from '../stubs/identityGzipUtils';
import {Message} from '../../impl/Message';

const getSquissStub = () => {
  return new SquissStub();
};

const getS3Stub = () => {
  return new S3Stub();
};

let inst = null;
let clock: any = null;
const msgSquissStub = getSquissStub();
const fooMsg = new Message({
  squiss: msgSquissStub,
  msg: {MessageId: 'foo', Body: 'foo'},
  s3Retriever: getS3Stub,
  s3Retain: false,
  messageGzip: testMessageGzip,
});
const barMsg = new Message({
  squiss: msgSquissStub,
  msg: {MessageId: 'bar', Body: 'bar'},
  s3Retriever: getS3Stub,
  s3Retain: false,
  messageGzip: testMessageGzip,
});
const bazMsg = new Message({
  squiss: msgSquissStub,
  msg: {MessageId: 'baz', Body: 'baz'},
  s3Retriever: getS3Stub,
  s3Retain: false,
  messageGzip: testMessageGzip,
});
const notExistError = new Error('Value AQEB5iHoiWO4nU0Tx3mGzJLdXNQ+fg3nadtYYTDoWMhuOiUOP7sjZTgC64MlRbSwFneA5+' +
  'C+fS5DGRbiEC1VAF0KTMEBrgEOVAQpwRQo8yfie8ltzf+0LLasaHrTB1IFDIvQ0+wsrM4PxXiDJD1tzQ2kw89ijfP4W4tAy6Dqvd5mhlAn' +
  'V+Gvq5IhSRrlzUx9ZOSZyoYPfWN7KwJVKrCWYIyGN3nkGaKwTc+HlJ3jABjTEWHULD9lZjWfBXMWY9bvIVvYuyg2BkSjqb/WKdM6eSPjIA' +
  'UxPIeI6HlkCccfAr9i2GeRmUJp+29g6l0kw3WKJ8msybx1kRzZ11E9++pbhay62SAZKeHZ/E+KuV1jwCJ9nFYPPPk/SwsgUSO1Q4ULYc/0' +
  ' for parameter ReceiptHandle is invalid. Reason: Message does not exist or is not available for visibility ' +
  'timeout change.');

describe('TimeoutExtender', () => {
  afterEach(() => {
    if (clock && clock.restore) {
      clock.restore();
    }
    inst = null;
  });
  it('adds and deletes a message through function calls', () => {
    inst = new TimeoutExtender(getSquissStub());
    inst.addMessage(fooMsg);
    inst._index.should.have.property('foo');
    inst.deleteMessage(fooMsg);
    inst._index.should.not.have.property('foo');
  });
  it('adds and deletes a message through events', () => {
    const squiss = getSquissStub();
    inst = new TimeoutExtender(squiss);
    const addSpy = sinon.spy(inst, 'addMessage');
    const delSpy = sinon.spy(inst, 'deleteMessage');
    squiss.emit('message', fooMsg);
    return delay(5).then(() => {
      addSpy.should.be.calledOnce();
      squiss.emit('handled', fooMsg);
      return delay(5);
    }).then(() => {
      delSpy.should.be.calledOnce();
    });
  });
  it('fails silently when asked to delete a nonexistent message', () => {
    inst = new TimeoutExtender(getSquissStub());
    inst.addMessage(fooMsg);
    inst.deleteMessage(barMsg);
  });
  it('tracks multiple messages', () => {
    inst = new TimeoutExtender(getSquissStub());
    inst.addMessage(fooMsg);
    inst.addMessage(barMsg);
    inst._index.should.have.property('foo');
    inst._index.should.have.property('bar');
  });
  it('deletes a head node', () => {
    inst = new TimeoutExtender(getSquissStub());
    inst.addMessage(fooMsg);
    inst.addMessage(barMsg);
    inst.addMessage(bazMsg);
    inst.deleteMessage(fooMsg);
    inst._linkedList.head!.message.raw.MessageId!.should.equal('bar');
  });
  it('deletes a tail node', () => {
    inst = new TimeoutExtender(getSquissStub());
    inst.addMessage(fooMsg);
    inst.addMessage(barMsg);
    inst.addMessage(bazMsg);
    inst.deleteMessage(bazMsg);
    inst._linkedList.tail!.message.raw.MessageId!.should.equal('bar');
  });
  it('deletes a middle node', () => {
    inst = new TimeoutExtender(getSquissStub());
    inst.addMessage(fooMsg);
    inst.addMessage(barMsg);
    inst.addMessage(bazMsg);
    inst.deleteMessage(barMsg);
    inst._linkedList.head!.next.message.raw.MessageId!.should.equal('baz');
  });
  it('renews a message approaching expiry', () => {
    clock = sinon.useFakeTimers(100000);
    const squiss = getSquissStub();
    const spy = sinon.spy(squiss, 'changeMessageVisibility');
    inst = new TimeoutExtender(squiss, {visibilityTimeoutSecs: 10});
    inst.addMessage(fooMsg);
    spy.should.not.be.called();
    clock.tick(6000);
    spy.should.be.calledOnce();
  });
  it('emits "timeoutExtended" on renewal', (done) => {
    clock = sinon.useFakeTimers(100000);
    const squiss = getSquissStub();
    squiss.on('timeoutExtended', (msg: Message) => {
      msg.should.equal(fooMsg);
      done();
    });
    inst = new TimeoutExtender(squiss, {visibilityTimeoutSecs: 10});
    inst.addMessage(fooMsg);
    clock.tick(6000);
  });
  it('renews two messages approaching expiry', () => {
    clock = sinon.useFakeTimers(100000);
    const squiss = getSquissStub();
    const spy = sinon.spy(squiss, 'changeMessageVisibility');
    inst = new TimeoutExtender(squiss, {visibilityTimeoutSecs: 20});
    inst.addMessage(fooMsg);
    clock.tick(10000);
    inst.addMessage(barMsg);
    spy.should.not.be.called();
    clock.tick(10000);
    spy.should.be.calledOnce();
    clock.tick(10000);
    spy.callCount.should.eql(3);
    clock.tick(10000);
    spy.callCount.should.eql(4);
  });
  it('renews multiple times with proper advanced time', () => {
    clock = sinon.useFakeTimers(100000);
    const squiss = getSquissStub();
    const spy = sinon.spy(squiss, 'changeMessageVisibility');
    inst = new TimeoutExtender(squiss, {visibilityTimeoutSecs: 20});
    inst.addMessage(fooMsg);
    clock.tick(10000);
    spy.should.not.be.called();
    clock.tick(5000);
    spy.should.be.calledOnce();
    clock.tick(15000);
    spy.should.be.calledTwice();
    clock.tick(15000);
    spy.should.be.calledThrice();
  });
  it('renews only until the configured age limit', () => {
    const keepSpyMessage = sinon.spy();
    const keepSpySquiss = sinon.spy();
    const timeoutSpyMessage = sinon.spy();
    const timeoutSpySquiss = sinon.spy();
    clock = sinon.useFakeTimers(100000);
    const squiss = getSquissStub();
    squiss.on('timeoutReached', timeoutSpySquiss);
    fooMsg.on('timeoutReached', timeoutSpyMessage);
    squiss.on('keep', keepSpySquiss);
    fooMsg.on('keep', keepSpyMessage);
    const spy = sinon.spy(squiss, 'changeMessageVisibility');
    inst = new TimeoutExtender(squiss, {visibilityTimeoutSecs: 10, noExtensionsAfterSecs: 15});
    inst.addMessage(fooMsg);
    clock.tick(10000);
    spy.should.be.calledOnce();
    clock.tick(20000);
    spy.should.be.calledOnce();
    fooMsg.isHandled().should.eql(true);
    keepSpyMessage.should.be.calledOnce();
    keepSpySquiss.should.be.calledOnce();
    keepSpySquiss.should.be.calledWith(fooMsg);
    timeoutSpyMessage.should.be.calledOnce();
    timeoutSpySquiss.should.be.calledOnce();
    timeoutSpySquiss.should.be.calledWith(fooMsg);
  });
  it('emits error on the parent Squiss object in case of issue', (done) => {
    clock = sinon.useFakeTimers(100000);
    const squiss = getSquissStub();
    squiss.on('autoExtendError', () => done());
    squiss.changeMessageVisibility = sinon.stub().returns(Promise.reject(new Error('test')));
    inst = new TimeoutExtender(squiss, {visibilityTimeoutSecs: 10});
    inst.addMessage(fooMsg);
    clock.tick(6000);
  });
  it('calls changeMessageVisibility with the appropriate timeout value', () => {
    clock = sinon.useFakeTimers(100000);
    const squiss = getSquissStub();
    const spy = sinon.spy(squiss, 'changeMessageVisibility');
    inst = new TimeoutExtender(squiss, {visibilityTimeoutSecs: 10});
    inst.addMessage(fooMsg);
    clock.tick(6000);
    spy.should.be.calledWith(fooMsg, 10);
  });
  it('emits autoExtendFail when an extended message has already been deleted', (done) => {
    clock = sinon.useFakeTimers(100000);
    const squiss = getSquissStub();
    squiss.on('autoExtendFail', (obj: any) => {
      try {
        obj.should.deep.equal({
          message: fooMsg,
          error: notExistError,
        });
      } catch (e) {
        return done(e);
      }
      return done();
    });
    squiss.changeMessageVisibility = sinon.stub().returns(Promise.reject(notExistError));
    inst = new TimeoutExtender(squiss, {visibilityTimeoutSecs: 10});
    inst.addMessage(fooMsg);
    clock.tick(6000);
  });
  it('extends only to the message lifetime maximum', () => {
    clock = sinon.useFakeTimers(43200000);
    const squiss = getSquissStub();
    const spy = sinon.spy(squiss, 'changeMessageVisibility');
    inst = new TimeoutExtender(squiss, {visibilityTimeoutSecs: 10});
    inst.addMessage(fooMsg);
    inst._linkedList.head!.receivedOn = 20000;
    clock.tick(6000);
    spy.should.be.calledWith(fooMsg, 10);
  });
});
