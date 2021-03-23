import * as proxyquire from 'proxyquire';

const uuidStub = () => {
    return 'my_uuid';
};
const stubs = {
    'uuid': {
        v4: uuidStub,
        '@global': true,
    },
};
// tslint:disable-next-line
const {Squiss: _SquissPatched} = proxyquire('../../impl/Squiss', stubs);
const {Message: _MessagePatched} = proxyquire('../../impl/Message', stubs);

import {ISquiss} from '../../types/ISquiss';
import {Squiss} from '../../impl/Squiss';
import {SQSStub} from '../stubs/SQSStub';
import delay from 'delay';
import {IMessageOpts, Message} from '../../impl/Message';
// @ts-ignore
import * as sinon from 'sinon';
import * as chai from 'chai';
import {EventEmitter} from 'events';
import {Blobs, S3Stub} from '../stubs/S3Stub';
import {SendMessageBatchResponse} from '../../types/SQSFacade';
import {testMessageGzip} from '../stubs/identityGzipUtils';
import {IMessage} from '../../types/IMessage';

// tslint:disable-next-line:variable-name
const SquissPatched: typeof Squiss = _SquissPatched;
// tslint:disable-next-line:variable-name
const MessagePatched: typeof Message = _MessagePatched;
const should = chai.should();
let inst: ISquiss;
let _inst: Squiss;
const wait = (ms?: number) => delay(ms === undefined ? 20 : ms);

const getS3Stub = (blobs?: Blobs) => {
    return new S3Stub(blobs);
};

const getSQSStub = () => {
    return new SQSStub();
};

const generateLargeMessage = (length: number) => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += 's';
    }
    return result;
};

describe('Squiss', () => {
    afterEach(() => {
        if (inst) {
            inst.stop();
        }
        if (_inst) {
            _inst.stop();
        }
        // @ts-ignore
        inst = null;
        // @ts-ignore
        _inst = null;
    });
    describe('constructor', () => {
        it('creates a new SquissPatched instance', () => {
            inst = new SquissPatched({
                S3: getS3Stub, SQS: getSQSStub,
                queueUrl: 'foo',
                unwrapSns: true,
                visibilityTimeoutSecs: 10,
                messageGzip: testMessageGzip,
            });
            should.exist(inst);
        });
        it('fails if queue is not specified', () => {
            let errored = false;
            try {
                new SquissPatched({
                    S3: getS3Stub, SQS: getSQSStub,
                    messageGzip: testMessageGzip,
                });
            } catch (e) {
                should.exist(e);
                e.should.be.instanceOf(Error);
                errored = true;
            }
            errored.should.eql(true);
        });
        it('fail if s3 but no bucket is not specified', () => {
            let errored = false;
            try {
                new SquissPatched({
                    S3: getS3Stub, SQS: getSQSStub,
                    messageGzip: testMessageGzip, queueUrl: 'foo', s3Fallback: true,
                });
            } catch (e) {
                should.exist(e);
                e.should.be.instanceOf(Error);
                errored = true;
            }
            errored.should.eql(true);
        });
        it('accepts an sqs function for instantiation if one is provided', () => {
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                queueUrl: 'foo',
                SQS: spy,
                messageGzip: testMessageGzip,
            });
            inst.should.have.property('sqs');
            spy.should.be.calledOnce();
        });
        it('accepts an s3 function for instantiation if one is provided', () => {
            const placeholder = {};
            const spy = sinon.stub().returns(placeholder);
            inst = new SquissPatched({
                queueUrl: 'foo',
                S3: spy,
                SQS: getSQSStub,
                messageGzip: testMessageGzip,
            });
            const s3 = inst.getS3();
            s3.should.eq(placeholder);
            inst.getS3();
            spy.should.be.calledOnce();
        });
        it('accepts an instance of sqs client if one is provided', () => {
            inst = new SquissPatched({
                queueUrl: 'foo',
                SQS: {} as any,
                S3: getS3Stub,
                messageGzip: testMessageGzip,
            });
            inst.should.have.property('sqs');
        });
        it('accepts an instance of s3 client if one is provided', () => {
            inst = new SquissPatched({
                queueUrl: 'foo',
                S3: {} as any,
                SQS: getSQSStub,
                messageGzip: testMessageGzip,
            });
            const s3 = inst.getS3();
            s3.should.be.an('object');
        });
    });
    describe('Receiving', () => {
        it('reports the appropriate "running" status', () => {
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: getSQSStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.running.should.eq(false);
            inst.start();
            inst.running.should.eq(true);
        });
        it('treats start() as idempotent', () => {
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: getSQSStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.running.should.eq(false);
            inst.start();
            inst.start();
            inst.running.should.eq(true);
        });
        it('receives a batch of messages under the max', () => {
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(5), queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.on('gotMessages', spy);
            inst.start();
            return wait().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith(5);
            });
        });
        it('receives batches of messages', () => {
            const batches: any = [];
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(15, 0), queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.on('gotMessages', (count: number) => batches.push({total: count, num: 0}));
            inst.on('message', () => batches[batches.length - 1].num++);
            inst.once('queueEmpty', spy);
            inst.start();
            return wait().then(() => {
                spy.should.be.calledOnce();
                batches.should.deep.equal([
                    {total: 10, num: 0},
                    {total: 5, num: 15},
                ]);
            });
        });
        it('receives batches of messages when maxInflight = receiveBatchSize', () => {
            const batches: any = [];
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(15, 0), queueUrl: 'foo', maxInFlight: 10, receiveBatchSize: 10,
                messageGzip: testMessageGzip,
            });
            inst.on('gotMessages', (count: number) => batches.push({total: count, num: 0}));
            inst.on('message', (m: IMessage) => {
                batches[batches.length - 1].num++;
                m.del();
            });
            inst.once('queueEmpty', spy);
            inst.start();
            return wait(40).then(() => {
                spy.should.be.calledOnce();
                batches.should.deep.equal([
                    {total: 10, num: 10},
                    {total: 5, num: 5},
                ]);
            });
        });
        it('receives batches of messages when maxInflight % receiveBatchSize != 0', () => {
            const batches: any = [];
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(15, 0), queueUrl: 'foo', maxInFlight: 15, receiveBatchSize: 10,
                messageGzip: testMessageGzip,
            });
            inst.on('gotMessages', (count: number) => batches.push({total: count, num: 0}));
            inst.once('queueEmpty', spy);
            inst.on('message', (m: IMessage) => {
                batches[batches.length - 1].num++;
            });
            inst.start();
            return wait().then(() => {
                spy.should.not.be.called();
                batches.should.deep.equal([
                    {total: 10, num: 0},
                    {total: 5, num: 15},
                ]);
            });
        });
        it('receives batches of messages as much as it can', () => {
            const batches: any = [];
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(16, 0), queueUrl: 'foo', maxInFlight: 15, receiveBatchSize: 10,
                messageGzip: testMessageGzip,
            });
            inst.on('gotMessages', (count: number) => batches.push({total: count, num: 0}));
            inst.once('queueEmpty', spy);
            inst.on('message', (m: IMessage) => {
                batches[batches.length - 1].num++;
                if (batches.length === 2 && batches[batches.length - 1].num === 5) {
                    m.del();
                }
            });
            inst.start();
            return wait().then(() => {
                spy.should.not.be.called();
                batches.should.deep.equal([
                    {total: 10, num: 0},
                    {total: 5, num: 15},
                    {total: 1, num: 1},
                ]);
            });
        });
        it('receives batches of messages as much as it can with min batch size', () => {
            const batches: any = [];
            const spy = sinon.spy();
            inst = new SquissPatched({
                queueUrl: 'foo',
                maxInFlight: 15,
                receiveBatchSize: 10,
                minReceiveBatchSize: 2,
                S3: getS3Stub,
                SQS: new SQSStub(16, 0),
                messageGzip: testMessageGzip,
            });
            inst.on('gotMessages', (count: number) => batches.push({total: count, num: 0}));
            inst.once('queueEmpty', spy);
            inst.on('message', (m: IMessage) => {
                batches[batches.length - 1].num++;
                if (batches.length === 2 && batches[batches.length - 1].num >= 14) {
                    m.del();
                }
            });
            inst.start();
            return wait().then(() => {
                spy.should.not.be.called();
                batches.should.deep.equal([
                    {total: 10, num: 0},
                    {total: 5, num: 15},
                    {total: 1, num: 1},
                ]);
            });
        });
        it('receives batches of messages as much as it can but with min batch size', () => {
            const batches: any = [];
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(16, 0),
                queueUrl: 'foo',
                maxInFlight: 15,
                receiveBatchSize: 10,
                minReceiveBatchSize: 2,
                messageGzip: testMessageGzip,
            });
            inst.on('gotMessages', (count: number) => batches.push({total: count, num: 0}));
            inst.once('queueEmpty', spy);
            inst.on('message', (m: IMessage) => {
                batches[batches.length - 1].num++;
                if (batches.length === 2 && batches[batches.length - 1].num === 5) {
                    m.del();
                }
            });
            inst.start();
            return wait().then(() => {
                spy.should.not.be.called();
                batches.should.deep.equal([
                    {total: 10, num: 0},
                    {total: 5, num: 15},
                ]);
            });
        });
        it('receives batches of messages as much as it can and gets empty', () => {
            const batches: any = [];
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(15, 0), queueUrl: 'foo', maxInFlight: 15, receiveBatchSize: 10,
                messageGzip: testMessageGzip,
            });
            inst.on('gotMessages', (count: number) => batches.push({total: count, num: 0}));
            inst.once('queueEmpty', spy);
            inst.on('message', (m: IMessage) => {
                batches[batches.length - 1].num++;
                if (batches.length === 2 && batches[batches.length - 1].num === 5) {
                    m.del();
                }
            });
            inst.start();
            return wait().then(() => {
                spy.should.be.calledOnce();
                batches.should.deep.equal([
                    {total: 10, num: 0},
                    {total: 5, num: 15},
                ]);
            });
        });
        it('emits error on message parse error', () => {
            const msgSpy = sinon.spy();
            const errorSpy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(0, 0),
                bodyFormat: 'json', queueUrl: 'foo', maxInFlight: 15,
                receiveBatchSize: 10,
                messageGzip: testMessageGzip,
            });
            inst.on('message', msgSpy);
            inst.on('error', errorSpy);
            inst.start();
            inst.sendMessage('{sdfsdf');
            return wait().then(() => {
                msgSpy.should.not.be.called();
                errorSpy.should.be.calledOnce();
                errorSpy.should.be.calledWith(sinon.match.instanceOf(Error));
            });
        });
        it('emits queueEmpty event with no messages', () => {
            const msgSpy = sinon.spy();
            const qeSpy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(0, 0), queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.on('message', msgSpy);
            inst.once('queueEmpty', qeSpy);
            inst.start();
            return wait().then(() => {
                msgSpy.should.not.be.called();
                qeSpy.should.be.calledOnce();
            });
        });
        it('emits aborted when stopped with an active message req', () => {
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(0, 1000), queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.on('aborted', spy);
            inst.start();
            return wait().then(() => {
                spy.should.not.be.called();
                inst.stop();
                return wait();
            }).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith(sinon.match.instanceOf(Error));
                inst.running.should.eq(false);
            });
        });
        it('should resolve when timeout exceeded and queue not drained', () => {
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1, 1000), queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.on('aborted', spy);
            inst.start();
            return wait().then(() => {
                spy.should.not.be.called();
                return inst.stop(false, 1000);
            }).then((result: boolean) => {
                result.should.eq(false);
            });
        });
        it('should resolve when queue already drained', () => {
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(0, 1000), queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.on('aborted', spy);
            inst.start();
            return wait().then(() => {
                spy.should.not.be.called();
                return inst.stop(false, 1000);
            }).then((result: boolean) => {
                result.should.eq(true);
            });
        });
        it('should resolve when queue drained before timeout', () => {
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1, 1000), queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.on('aborted', spy);
            inst.on('message', (msg: IMessage) => {
                setTimeout(() => {
                    msg.del();
                }, 1000);
            });
            inst.start();
            return wait().then(() => {
                spy.should.not.be.called();
                return inst.stop(false, 10000);
            }).then((result: boolean) => {
                result.should.eq(true);
            });
        });
        it('should not double resolve if queue drained after timeout', function () {
            this.timeout(5000);
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1, 1000), queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            inst.on('aborted', spy);
            inst.on('message', (msg: IMessage) => {
                setTimeout(() => {
                    msg.del();
                }, 1000);
            });
            inst.start();
            return wait().then(() => {
                spy.should.not.be.called();
                return inst.stop(false, 50);
            }).then((result: boolean) => {
                result.should.eq(false);
                return wait(2000);
            });
        });
        it('observes the maxInFlight cap', () => {
            const msgSpy = sinon.spy();
            const maxSpy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(15), queueUrl: 'foo', maxInFlight: 10,
                messageGzip: testMessageGzip,
            });
            inst.on('message', msgSpy);
            inst.on('maxInFlight', maxSpy);
            inst.start();
            return wait().then(() => {
                msgSpy.should.have.callCount(10);
                maxSpy.should.have.callCount(1);
            });
        });
        it('respects maxInFlight as 0 (no cap)', () => {
            const msgSpy = sinon.spy();
            const qeSpy = sinon.spy();
            const gmSpy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(35, 0), queueUrl: 'foo', maxInFlight: 0,
                messageGzip: testMessageGzip,
            });
            inst.on('message', msgSpy);
            inst.on('gotMessages', gmSpy);
            inst.once('queueEmpty', qeSpy);
            inst.start();
            return wait(50).then(() => {
                msgSpy.should.have.callCount(35);
                gmSpy.should.have.callCount(4);
                qeSpy.should.have.callCount(1);
            });
        });
        it('reports the correct number of inFlight messages', () => {
            const msgs: IMessage[] = [];
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(5), queueUrl: 'foo', deleteWaitMs: 1,
                messageGzip: testMessageGzip,
            });
            inst.on('message', (msg: IMessage) => msgs.push(msg));
            inst.start();
            return wait().then(() => {
                inst.inFlight.should.equal(5);
                inst.deleteMessage(msgs.pop()!);
                inst.handledMessage(new EventEmitter() as Message);
                return wait(1);
            }).then(() => {
                inst.inFlight.should.equal(3);
            });
        });
        it('pauses polling when maxInFlight is reached; resumes after', () => {
            const msgSpy = sinon.spy();
            const maxSpy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(11, 1000), queueUrl: 'foo', maxInFlight: 10,
                messageGzip: testMessageGzip,
            });
            inst.on('message', msgSpy);
            inst.on('maxInFlight', maxSpy);
            inst.start();
            return wait().then(() => {
                msgSpy.should.have.callCount(10);
                maxSpy.should.be.calledOnce();
                for (let i = 0; i < 10; i++) {
                    inst.handledMessage(new EventEmitter() as Message);
                }
                return wait();
            }).then(() => {
                msgSpy.should.have.callCount(11);
            });
        });
        it('observes the visibilityTimeout setting', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', visibilityTimeoutSecs: 10,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'receiveMessage');
            inst.start();
            return wait().then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    AttributeNames: ['All'],
                    MessageAttributeNames: ['All'],
                    MaxNumberOfMessages: 10,
                    WaitTimeSeconds: 20,
                    VisibilityTimeout: 10,
                });
            });
        });
        it('observes activePollIntervalMs', () => {
            const abortSpy = sinon.spy();
            const gmSpy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1, 0), queueUrl: 'foo', activePollIntervalMs: 1000,
                messageGzip: testMessageGzip,
            });
            inst.on('aborted', abortSpy);
            inst.on('gotMessages', gmSpy);
            inst.start();
            return wait().then(() => {
                gmSpy.should.be.calledOnce();
                abortSpy.should.not.be.called();
            });
        });
        it('observes idlePollIntervalMs', () => {
            const abortSpy = sinon.spy();
            const qeSpy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1, 0), queueUrl: 'foo', idlePollIntervalMs: 1000,
                messageGzip: testMessageGzip,
            });
            inst.on('aborted', abortSpy);
            inst.on('queueEmpty', qeSpy);
            inst.start();
            return wait().then(() => {
                qeSpy.should.be.calledOnce();
                abortSpy.should.not.be.called();
            });
        });
        it('receiveAttributes defaults to all', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'receiveMessage');
            inst.start();
            return wait().then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MaxNumberOfMessages: 10,
                    WaitTimeSeconds: 20,
                    AttributeNames: ['All'],
                    MessageAttributeNames: ['All'],
                });
            });
        });
        it('observes receiveAttributes', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', receiveAttributes: ['a'],
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'receiveMessage');
            inst.start();
            return wait().then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MaxNumberOfMessages: 10,
                    WaitTimeSeconds: 20,
                    AttributeNames: ['All'],
                    MessageAttributeNames: ['a'],
                });
            });
        });
        it('observes receiveSqsAttributes', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', receiveSqsAttributes: ['a'],
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'receiveMessage');
            inst.start();
            return wait().then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MaxNumberOfMessages: 10,
                    WaitTimeSeconds: 20,
                    AttributeNames: ['a'],
                    MessageAttributeNames: ['All'],
                });
            });
        });
    });
    describe('Deleting', () => {
        it('deletes messages using internal API', () => {
            const sqsStub = new SQSStub(5);
            const msgs: IMessage[] = [];
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', deleteWaitMs: 1,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'deleteMessageBatch');
            inst.on('message', (msg: IMessage) => msgs.push(msg));
            inst.start();
            let promise: Promise<void>;
            return wait().then(() => {
                msgs.should.have.length(5);
                promise = inst.deleteMessage(msgs.pop()!);
                return wait(10);
            }).then(() => {
                spy.should.be.calledOnce();
                return promise!.should.be.fulfilled('should be fullfiled');
            });
        });
        it('deletes messages using Message API', () => {
            const sqsStub = new SQSStub(5);
            const msgs: IMessage[] = [];
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', deleteWaitMs: 1,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'deleteMessageBatch');
            inst.on('message', (msg: IMessage) => msgs.push(msg));
            inst.start();
            return wait().then(() => {
                msgs.should.have.length(5);
                msgs.pop()!.del();
                return wait(10);
            }).then(() => {
                spy.should.be.calledOnce();
            });
        });
        it('deletes messages in batches', () => {
            const sqsStub = new SQSStub(15);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', deleteWaitMs: 10,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'deleteMessageBatch');
            inst.on('message', (msg: IMessage) => msg.del());
            inst.start();
            return wait().then(() => {
                spy.should.be.calledTwice();
            });
        });
        it('deletes messages in batches without duplicates', () => {
            const sqsStub = new SQSStub(15);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', deleteWaitMs: 10,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'deleteMessageBatch');
            inst.on('message', (msg: IMessage) => {
                inst.deleteMessage(msg);
                inst.deleteMessage(msg);
            });
            inst.start();
            return wait().then(() => {
                spy.should.be.calledTwice();
            });
        });
        it('deletes immediately with batch size=1', () => {
            const sqsStub = new SQSStub(5);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', deleteBatchSize: 1,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'deleteMessageBatch');
            inst.on('message', (msg: IMessage) => msg.del());
            inst.start();
            return wait().then(() => {
                spy.should.have.callCount(5);
            });
        });
        it('emits deleted event', () => {
            const msgSpyMessage = sinon.spy();
            const msgSpySquiss = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1), queueUrl: 'foo', deleteBatchSize: 1,
                messageGzip: testMessageGzip,
            });
            let message: IMessage;
            inst.on('message', (msg: IMessage) => {
                message = msg;
                msg.on('deleted', msgSpyMessage);
                msg.del();
            });
            inst.on('deleted', msgSpySquiss);
            inst.start();
            return wait().then(() => {
                msgSpyMessage.should.be.calledOnce();
                msgSpyMessage.should.be.calledWith('id_0');
                msgSpySquiss.should.be.calledOnce();
                msgSpySquiss.should.be.calledWith({successId: 'id_0', msg: message});
            });
        });
        it('delWaitTime timeout should be cleared after timeout runs', () => {
            const msgs: IMessage[] = [];
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(2), queueUrl: 'foo', deleteBatchSize: 10, deleteWaitMs: 10,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(inst, '_deleteMessages');
            inst.on('message', (msg: IMessage) => msgs.push(msg));
            inst.start();
            return wait().then(() => {
                inst.stop();
                msgs[0].del();
                return wait(15);
            }).then(() => {
                spy.should.be.calledOnce();
                msgs[1].del();
                return wait(15);
            }).then(() => {
                spy.should.be.calledTwice();
            });
        });
        it('requires a Message object be sent to deleteMessage', () => {
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: getSQSStub, queueUrl: 'foo', deleteBatchSize: 1,
                messageGzip: testMessageGzip,
            });
            const promise = inst.deleteMessage('foo' as any as Message);
            return promise.should.be.rejectedWith(/Message/);
        });
    });
    describe('Failures', () => {
        it('emits delError when a message fails to delete', () => {
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1), queueUrl: 'foo', deleteBatchSize: 1,
                messageGzip: testMessageGzip,
            });
            inst.on('delError', spy);
            const msg = new MessagePatched({
                msg: {
                    MessageId: 'foo',
                    ReceiptHandle: 'bar',
                    Body: 'baz',
                },
            } as IMessageOpts);
            const expectedError = {Code: '404', Id: 'foo', Message: 'Does not exist', SenderFault: true};
            const deletePromise = inst.deleteMessage(msg)
                .then(() => {
                    throw new Error('should throw');
                })
                .catch((err) => {
                    err.should.eql(expectedError);
                });
            const spyPromise = wait().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({message: msg, error: expectedError});
            });
            return Promise.all([deletePromise, spyPromise]);
        });
        it('emits error when no id is returned in failed to delete message', () => {
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1, undefined, {
                    noIdInFailedToDeleteMessage: true,
                    failToDeleteMessage: true,
                }), queueUrl: 'foo', deleteBatchSize: 1,
                messageGzip: testMessageGzip,
            });
            inst.on('error', spy);
            const msg = new MessagePatched({
                msg: {
                    MessageId: 'foo',
                    ReceiptHandle: 'bar',
                    Body: 'baz',
                },
            } as IMessageOpts);
            inst.deleteMessage(msg)
            return wait().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith(sinon.match.instanceOf(Error));
                spy.getCall(0).firstArg.message.should.eql('No id returned in failed message response')
            });
        });
        it('emits error when no id is returned in deleted message', () => {
            const spy = sinon.spy();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(2, undefined, {
                    noIdInDeletedMessage: true,
                }), queueUrl: 'foo', deleteBatchSize: 1,
                messageGzip: testMessageGzip,
            });
            inst.on('error', spy);
            const msg = new MessagePatched({
                msg: {
                    MessageId: 'foo',
                    ReceiptHandle: '1',
                    Body: 'baz',
                },
            } as IMessageOpts);
            inst.deleteMessage(msg)
            return wait().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith(sinon.match.instanceOf(Error));
                spy.getCall(0).firstArg.message.should.eql('No id returned in success message response')
            });
        });
        it('emits error when delete call fails', () => {
            const spy = sinon.spy();
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', deleteBatchSize: 1,
                messageGzip: testMessageGzip,
            });
            sqsStub.deleteMessageBatch = () => Promise.reject(new Error('test'));
            inst.on('error', spy);
            const msg = new EventEmitter() as Message;
            msg.raw = {
                MessageId: 'foo',
                ReceiptHandle: 'bar',
            };
            inst.deleteMessage(msg);
            return wait().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith(sinon.match.instanceOf(Error));
            });
        });
        it('emits error when receive call fails', () => {
            const spy = sinon.spy();
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            sqsStub.receiveMessage = (() => {
                return {
                    promise: () => Promise.reject(new Error('test')),
                    abort: () => {
                        // Empty
                    },
                };
            });
            inst.on('error', spy);
            inst.start();
            return wait().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith(sinon.match.instanceOf(Error));
            });
        });
        it('attempts to restart polling after a receive call fails', () => {
            const msgSpy = sinon.spy();
            const errSpy = sinon.spy();
            const sqsStub = new SQSStub(2);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', receiveBatchSize: 1, pollRetryMs: 5,
                messageGzip: testMessageGzip,
            });
            (sinon.stub(sqsStub, 'receiveMessage').callsFake(() => {
                (sqsStub.receiveMessage as any).restore();
                return {
                    promise: () => Promise.reject(new Error('test')),
                    abort: () => {
                        // Empty
                    },
                };
            }));
            inst.on('message', msgSpy);
            inst.on('error', errSpy);
            inst.start();
            return wait().then(() => {
                errSpy.should.be.calledOnce();
                msgSpy.should.be.calledTwice();
            });
        });
        it('emits error when GetQueueURL call fails', () => {
            const spy = sinon.spy();
            const sqsStub = new SQSStub(2);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueName: 'foo',
                messageGzip: testMessageGzip,
            });
            sqsStub.getQueueUrl = () => Promise.reject(new Error('test'));
            inst.on('error', spy);
            inst.start();
            return wait().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith(sinon.match.instanceOf(Error));
            });
        });
    });
    describe('Testing', () => {
        it('allows queue URLs to be corrected to the endpoint hostname', () => {
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1), queueName: 'foo', correctQueueUrl: true,
                messageGzip: testMessageGzip,
            });
            return inst.getQueueUrl().then((url: string) => {
                url.should.equal('https://foo.bar/queues/foo');
            });
        });
    });
    describe('createQueue', () => {
        it('rejects if Squiss was instantiated without queueName', () => {
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1), queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            return inst.createQueue().should.be.rejected('not rejected');
        });
        it('calls SQS SDK createQueue method with default attributes', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueName: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'createQueue');
            return inst.createQueue().then((queueUrl: string) => {
                queueUrl.should.be.a('string');
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueName: 'foo',
                    Attributes: {
                        ReceiveMessageWaitTimeSeconds: '20',
                        DelaySeconds: '0',
                        MaximumMessageSize: '262144',
                        MessageRetentionPeriod: '345600',
                    },
                });
            });
        });
        it('configures VisibilityTimeout if specified', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueName: 'foo', visibilityTimeoutSecs: 15,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'createQueue');
            return inst.createQueue().then((queueUrl: string) => {
                queueUrl.should.be.a('string');
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueName: 'foo',
                    Attributes: {
                        ReceiveMessageWaitTimeSeconds: '20',
                        DelaySeconds: '0',
                        MaximumMessageSize: '262144',
                        MessageRetentionPeriod: '345600',
                        VisibilityTimeout: '15',
                    },
                });
            });
        });
        it('calls SQS SDK createQueue method with custom attributes', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                queueName: 'foo',
                receiveWaitTimeSecs: 10,
                delaySecs: 300,
                maxMessageBytes: 100,
                messageRetentionSecs: 60,
                visibilityTimeoutSecs: 10,
                queuePolicy: 'foo',
                S3: getS3Stub,
                SQS: sqsStub,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'createQueue');
            return inst.createQueue().then((queueUrl: string) => {
                queueUrl.should.be.a('string');
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueName: 'foo',
                    Attributes: {
                        ReceiveMessageWaitTimeSeconds: '10',
                        DelaySeconds: '300',
                        MaximumMessageSize: '100',
                        MessageRetentionPeriod: '60',
                        VisibilityTimeout: '10',
                        Policy: 'foo',
                    },
                });
            });
        });
    });
    describe('changeMessageVisibility', () => {
        it('calls SQS SDK changeMessageVisibility method', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'changeMessageVisibility');
            return inst.changeMessageVisibility('bar', 1).then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    ReceiptHandle: 'bar',
                    VisibilityTimeout: 1,
                });
            });
        });
        it('calls SQS SDK changeMessageVisibility method 2', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'changeMessageVisibility');
            const msg = new MessagePatched({
                msg: {
                    ReceiptHandle: 'bar',
                },
            } as IMessageOpts);
            return inst.changeMessageVisibility(msg, 1).then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    ReceiptHandle: 'bar',
                    VisibilityTimeout: 1,
                });
            });
        });
    });
    describe('deleteQueue', () => {
        it('calls SQS SDK deleteQueue method with queue URL', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'deleteQueue');
            return inst.deleteQueue().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({QueueUrl: 'foo'});
            });
        });
    });
    describe('getQueueUrl', () => {
        it('resolves with the provided queueUrl without hitting SQS', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'getQueueUrl');
            return inst.getQueueUrl().then((queueUrl: string) => {
                queueUrl.should.equal('foo');
                spy.should.not.be.called();
            });
        });
        it('asks SQS for the URL if queueUrl was not provided', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueName: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'getQueueUrl');
            return inst.getQueueUrl().then((queueUrl: string) => {
                queueUrl.indexOf('http').should.equal(0);
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueName: 'foo',
                });
            });
        });
        it('caches the queueUrl after the first call to SQS', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueName: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'getQueueUrl');
            return inst.getQueueUrl().then(() => {
                spy.should.be.calledOnce();
                return inst.getQueueUrl();
            }).then(() => {
                spy.should.be.calledOnce();
            });
        });
        it('includes the account number if provided', () => {
            const sqsStub = new SQSStub(1);
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueName: 'foo', accountNumber: 1234,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'getQueueUrl');
            return inst.getQueueUrl().then((queueUrl: string) => {
                queueUrl.indexOf('http').should.equal(0);
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueName: 'foo',
                    QueueOwnerAWSAccountId: '1234',
                });
            });
        });
    });
    describe('getQueueVisibilityTimeout', () => {
        it('makes a successful API call', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'https://foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'getQueueAttributes');
            return inst.getQueueVisibilityTimeout().then((timeout: number) => {
                should.exist(timeout);
                timeout.should.equal(31);
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    AttributeNames: ['VisibilityTimeout'],
                    QueueUrl: 'https://foo',
                });
            });
        });
        it('caches the API call for successive function calls', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'https://foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'getQueueAttributes');
            return inst.getQueueVisibilityTimeout().then((timeout: number) => {
                timeout.should.equal(31);
                spy.should.be.calledOnce();
                return inst.getQueueVisibilityTimeout();
            }).then((timeout: number) => {
                should.exist(timeout);
                timeout.should.equal(31);
                spy.should.be.calledOnce();
            });
        });
        it('catches badly formed AWS responses', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            sqsStub.getQueueAttributes = sinon.stub().returns(Promise.resolve({foo: 'bar'}));
            return inst.getQueueVisibilityTimeout().should.be.rejectedWith(/foo/);
        });
    });
    describe('getQueueMaximumMessageSize', () => {
        it('makes a successful API call', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'https://foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'getQueueAttributes');
            return inst.getQueueMaximumMessageSize().then((timeout: number) => {
                should.exist(timeout);
                timeout.should.equal(200);
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    AttributeNames: ['MaximumMessageSize'],
                    QueueUrl: 'https://foo',
                });
            });
        });
        it('caches the API call for successive function calls', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'https://foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'getQueueAttributes');
            return inst.getQueueMaximumMessageSize().then((timeout: number) => {
                timeout.should.equal(200);
                spy.should.be.calledOnce();
                return inst.getQueueMaximumMessageSize();
            }).then((timeout: number) => {
                should.exist(timeout);
                timeout.should.equal(200);
                spy.should.be.calledOnce();
            });
        });
        it('catches badly formed AWS responses', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            sqsStub.getQueueAttributes = sinon.stub().returns(Promise.resolve({foo: 'bar'}));
            return inst.getQueueMaximumMessageSize().should.be.rejectedWith(/foo/);
        });
    });
    describe('releaseMessage', () => {
        it('marks the message as handled and changes visibility to 0', () => {
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(1), queueName: 'foo',
                messageGzip: testMessageGzip,
            });
            const handledSpy = sinon.spy(inst, 'handledMessage');
            const visibilitySpy = sinon.spy(inst, 'changeMessageVisibility');
            const msg = new EventEmitter() as IMessage;
            (msg as any).raw = {};
            return inst.releaseMessage(msg).then(() => {
                handledSpy.should.be.calledOnce();
                visibilitySpy.should.be.calledOnce();
                visibilitySpy.should.be.calledWith(msg, 0);
            });
        });
    });
    describe('purgeQueue', () => {
        it('calls SQS SDK purgeQueue method with queue URL', () => {
            const stub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: stub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(stub, 'purgeQueue');
            return inst.purgeQueue().then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({QueueUrl: 'foo'});
                stub.msgs.length.should.equal(0);
                stub.msgCount.should.equal(0);
            });
        });
    });
    describe('sendMessage', () => {
        it('sends a string message with no extra arguments', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessage');
            return inst.sendMessage('bar').then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({QueueUrl: 'foo', MessageBody: 'bar'});
            });
        });
        it('sends a string gzip message with no extra arguments', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', gzip: true,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessage');
            return inst.sendMessage('{"i": 1}').then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueUrl: 'foo', MessageBody: 'iwOAeyJpIjogMX0D', MessageAttributes: {
                        __SQS_GZIP__: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                    },
                });
            });
        });
        it('sends a JSON message with no extra arguments', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessage');
            return inst.sendMessage({bar: 'baz'}).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({QueueUrl: 'foo', MessageBody: '{"bar":"baz"}'});
            });
        });
        it('sends a message with a delay and attributes', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const buffer = Buffer.from('s');
            const spy = sinon.spy(sqsStub, 'sendMessage');
            return inst.sendMessage('bar', 10, {
                baz: 'fizz',
                num: 1,
                boolean1: true,
                boolean2: false,
                bin: buffer,
                empty: undefined,
            }).then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: 'bar',
                    DelaySeconds: 10,
                    MessageAttributes: {
                        baz: {
                            DataType: 'String',
                            StringValue: 'fizz',
                        },
                        boolean1: {
                            DataType: 'String',
                            StringValue: 'true',
                        },
                        boolean2: {
                            DataType: 'String',
                            StringValue: 'false',
                        },
                        empty: {
                            DataType: 'String',
                            StringValue: '',
                        },
                        num: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                        bin: {
                            DataType: 'Binary',
                            BinaryValue: buffer,
                        },
                    },
                });
            });
        });
        it('sends a S3 message with a delay and attributes', () => {
            const blobs: Blobs = {};
            const s3Stub = getS3Stub(blobs);
            const bucket = 'my_bucket';
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: s3Stub,
                SQS: sqsStub,
                queueUrl: 'foo',
                s3Fallback: true,
                s3Bucket: bucket,
                messageGzip: testMessageGzip,
            });
            const buffer = Buffer.from('s');
            const spy = sinon.spy(sqsStub, 'sendMessage');
            const largeMessage = generateLargeMessage(300);
            let squissS3UploadEventEmitted = false;
            inst.on('s3Upload', (data) => {
                data.bucket.should.eql(bucket);
                data.key.should.eql('my_uuid');
                data.uploadSize.should.eql(300);
                squissS3UploadEventEmitted = true;
            });
            return inst.sendMessage(largeMessage, 10, {
                baz: 'fizz',
                num: 1,
                boolean1: true,
                boolean2: false,
                bin: buffer,
                empty: undefined,
            }).then(() => {
                squissS3UploadEventEmitted.should.eql(true);
                blobs.my_bucket!.my_uuid.should.be.eq(largeMessage);
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: '{"uploadSize":300,"bucket":"my_bucket","key":"my_uuid"}',
                    DelaySeconds: 10,
                    MessageAttributes: {
                        __SQS_S3__: {DataType: 'Number', StringValue: '300'},
                        baz: {
                            DataType: 'String',
                            StringValue: 'fizz',
                        },
                        boolean1: {
                            DataType: 'String',
                            StringValue: 'true',
                        },
                        boolean2: {
                            DataType: 'String',
                            StringValue: 'false',
                        },
                        empty: {
                            DataType: 'String',
                            StringValue: '',
                        },
                        num: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                        bin: {
                            DataType: 'Binary',
                            BinaryValue: buffer,
                        },
                    },
                });
            });
        });
        it('sends a S3 message with a delay and attributes and s3 prefix', () => {
            const blobs: Blobs = {};
            const s3Stub = getS3Stub(blobs);
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: s3Stub, queueUrl: 'foo', s3Fallback: true, s3Bucket: 'my_bucket',
                s3Prefix: 'my_prefix/',
                SQS: sqsStub,
                messageGzip: testMessageGzip,
            });
            const buffer = Buffer.from('s');
            const spy = sinon.spy(sqsStub, 'sendMessage');
            const largeMessage = generateLargeMessage(300);
            return inst.sendMessage(largeMessage, 10, {
                baz: 'fizz',
                num: 1,
                boolean1: true,
                boolean2: false,
                bin: buffer,
                empty: undefined,
            }).then(() => {
                blobs.my_bucket!['my_prefix/my_uuid'].should.be.eq(largeMessage);
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: '{"uploadSize":300,"bucket":"my_bucket","key":"my_prefix/my_uuid"}',
                    DelaySeconds: 10,
                    MessageAttributes: {
                        __SQS_S3__: {DataType: 'Number', StringValue: '300'},
                        baz: {
                            DataType: 'String',
                            StringValue: 'fizz',
                        },
                        boolean1: {
                            DataType: 'String',
                            StringValue: 'true',
                        },
                        boolean2: {
                            DataType: 'String',
                            StringValue: 'false',
                        },
                        empty: {
                            DataType: 'String',
                            StringValue: '',
                        },
                        num: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                        bin: {
                            DataType: 'Binary',
                            BinaryValue: buffer,
                        },
                    },
                });
            });
        });
        it('sends a S3 message with a delay and no attributes', () => {
            const blobs: Blobs = {};
            const s3Stub = getS3Stub(blobs);
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                SQS: sqsStub, S3: s3Stub, queueUrl: 'foo', s3Fallback: true, s3Bucket: 'my_bucket',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessage');
            const largeMessage = generateLargeMessage(300);
            return inst.sendMessage(largeMessage, 10).then(() => {
                blobs.my_bucket!.my_uuid.should.be.eq(largeMessage);
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: '{"uploadSize":300,"bucket":"my_bucket","key":"my_uuid"}',
                    DelaySeconds: 10,
                    MessageAttributes: {
                        __SQS_S3__: {DataType: 'Number', StringValue: '300'},
                    },
                });
            });
        });
        it('sends a S3 message if it is bigger than minS3Size', () => {
            const blobs: Blobs = {};
            const s3Stub = getS3Stub(blobs);
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                SQS: sqsStub,
                S3: s3Stub,
                queueUrl: 'foo',
                s3Fallback: true,
                s3Bucket: 'my_bucket',
                minS3Size: 250,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessage');
            const largeMessage = generateLargeMessage(300);
            return inst.sendMessage(largeMessage, 10).then(() => {
                blobs.my_bucket!.my_uuid.should.be.eq(largeMessage);
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: '{"uploadSize":300,"bucket":"my_bucket","key":"my_uuid"}',
                    DelaySeconds: 10,
                    MessageAttributes: {
                        __SQS_S3__: {DataType: 'Number', StringValue: '300'},
                    },
                });
            });
        });
        it('does not send a S3 message if it is smaller than minS3Size', () => {
            const blobs: Blobs = {};
            const s3Stub = getS3Stub(blobs);
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                SQS: sqsStub,
                S3: s3Stub,
                queueUrl: 'foo',
                s3Fallback: true,
                s3Bucket: 'my_bucket',
                minS3Size: 500,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessage');
            const largeMessage = generateLargeMessage(300);
            return inst.sendMessage(largeMessage, 10).then(() => {
                Object.keys(blobs).length.should.be.eq(0);
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: largeMessage,
                    DelaySeconds: 10,
                });
            });
        });
        it('sends a skipped S3 message with a delay and attributes', () => {
            const blobs: Blobs = {};
            const s3Stub = getS3Stub(blobs);
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                SQS: sqsStub,
                S3: s3Stub, queueUrl: 'foo', s3Fallback: true, s3Bucket: 'my_bucket',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessage');
            const smallMessage = generateLargeMessage(50);
            return inst.sendMessage(smallMessage, 10, {
                baz: 'fizz',
            }).then(() => {
                blobs.should.not.have.property('my_bucket');
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: smallMessage,
                    DelaySeconds: 10,
                    MessageAttributes: {
                        baz: {
                            DataType: 'String',
                            StringValue: 'fizz',
                        },
                    },
                });
            });
        });
        it('sends a message with a delay and not allowed internal gzip attribute', (done) => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const buffer = Buffer.from('s');
            const spy = sinon.spy(sqsStub, 'sendMessage');
            inst.sendMessage('bar', 10, {
                baz: 'fizz',
                num: 1,
                __SQS_GZIP__: true,
                boolean1: true,
                boolean2: false,
                bin: buffer,
                empty: undefined,
            }).catch((err: Error) => {
                spy.should.have.callCount(0);
                err.should.be.instanceOf(Error);
                err.message.should.be.eq('Using of internal attribute __SQS_GZIP__ is not allowed');
                done();
            });
        });
        it('sends a message with a delay and not allowed internal s3 attribute', (done) => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const buffer = Buffer.from('s');
            const spy = sinon.spy(sqsStub, 'sendMessage');
            inst.sendMessage('bar', 10, {
                baz: 'fizz',
                num: 1,
                __SQS_S3__: true,
                boolean1: true,
                boolean2: false,
                bin: buffer,
                empty: undefined,
            }).catch((err: Error) => {
                spy.should.have.callCount(0);
                err.should.be.instanceOf(Error);
                err.message.should.be.eq('Using of internal attribute __SQS_S3__ is not allowed');
                done();
            });
        });
        it('sends a gzip message with a delay and attributes', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', gzip: true,
                messageGzip: testMessageGzip,
            });
            const buffer = Buffer.from('s');
            const spy = sinon.spy(sqsStub, 'sendMessage');
            return inst.sendMessage({'i': 1}, 10, {
                baz: 'fizz',
                num: 1,
                boolean1: true,
                boolean2: false,
                bin: buffer,
                empty: undefined,
            }).then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: 'CwOAeyJpIjoxfQM=',
                    DelaySeconds: 10,
                    MessageAttributes: {
                        __SQS_GZIP__: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                        baz: {
                            DataType: 'String',
                            StringValue: 'fizz',
                        },
                        boolean1: {
                            DataType: 'String',
                            StringValue: 'true',
                        },
                        boolean2: {
                            DataType: 'String',
                            StringValue: 'false',
                        },
                        empty: {
                            DataType: 'String',
                            StringValue: '',
                        },
                        num: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                        bin: {
                            DataType: 'Binary',
                            BinaryValue: buffer,
                        },
                    },
                });
            });
        });
        it('sends a gzip message with a delay and attributes when gzip limit is passed', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', gzip: true, minGzipSize: 20,
                messageGzip: testMessageGzip,
            });
            const buffer = Buffer.from('s');
            const largeMessage = generateLargeMessage(200);
            const spy = sinon.spy(sqsStub, 'sendMessage');
            return inst.sendMessage(largeMessage, 10, {
                baz: 'fizz',
                num: 1,
                boolean1: true,
                boolean2: false,
                bin: buffer,
                empty: undefined,
            }).then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: 'G8cA+CXmYrFAIAA=',
                    DelaySeconds: 10,
                    MessageAttributes: {
                        __SQS_GZIP__: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                        baz: {
                            DataType: 'String',
                            StringValue: 'fizz',
                        },
                        boolean1: {
                            DataType: 'String',
                            StringValue: 'true',
                        },
                        boolean2: {
                            DataType: 'String',
                            StringValue: 'false',
                        },
                        empty: {
                            DataType: 'String',
                            StringValue: '',
                        },
                        num: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                        bin: {
                            DataType: 'Binary',
                            BinaryValue: buffer,
                        },
                    },
                });
            });
        });
        it('sends a non gzip message with a delay and attributes when gzip limit is not passed', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', gzip: true, minGzipSize: 500,
                messageGzip: testMessageGzip,
            });
            const buffer = Buffer.from('s');
            const largeMessage = generateLargeMessage(200);
            const spy = sinon.spy(sqsStub, 'sendMessage');
            return inst.sendMessage(largeMessage, 10, {
                baz: 'fizz',
                num: 1,
                boolean1: true,
                boolean2: false,
                bin: buffer,
                empty: undefined,
            }).then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: largeMessage,
                    DelaySeconds: 10,
                    MessageAttributes: {
                        baz: {
                            DataType: 'String',
                            StringValue: 'fizz',
                        },
                        boolean1: {
                            DataType: 'String',
                            StringValue: 'true',
                        },
                        boolean2: {
                            DataType: 'String',
                            StringValue: 'false',
                        },
                        empty: {
                            DataType: 'String',
                            StringValue: '',
                        },
                        num: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                        bin: {
                            DataType: 'Binary',
                            BinaryValue: buffer,
                        },
                    },
                });
            });
        });
        it('sends a message with a delay and attributes and fifo attributes', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const buffer = Buffer.from('s');
            const spy = sinon.spy(sqsStub, 'sendMessage');
            return inst.sendMessage('bar', 10, {
                FIFO_MessageGroupId: 'groupId',
                FIFO_MessageDeduplicationId: 'dedupId',
                baz: 'fizz',
                num: 1,
                bin: buffer,
                empty: undefined,
            }).then(() => {
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    MessageBody: 'bar',
                    DelaySeconds: 10,
                    MessageDeduplicationId: 'dedupId',
                    MessageGroupId: 'groupId',
                    MessageAttributes: {
                        baz: {
                            DataType: 'String',
                            StringValue: 'fizz',
                        },
                        empty: {
                            DataType: 'String',
                            StringValue: '',
                        },
                        num: {
                            DataType: 'Number',
                            StringValue: '1',
                        },
                        bin: {
                            DataType: 'Binary',
                            BinaryValue: buffer,
                        },
                    },
                });
            });
        });
    });
    describe('sendMessages', () => {
        it('sends a single string message with no extra arguments', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessageBatch');
            return inst.sendMessages('bar').then((res: SendMessageBatchResponse) => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    Entries: [
                        {Id: '0', MessageBody: 'bar'},
                    ],
                });
                res.should.have.property('Successful').with.length(1);
                res.Successful[0].should.have.property('Id').equal('0');
            });
        });
        it('sends a single JSON message with no extra arguments', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessageBatch');
            return inst.sendMessages({bar: 'baz'}).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    Entries: [
                        {Id: '0', MessageBody: '{"bar":"baz"}'},
                    ],
                });
            });
        });
        it('sends a multiple JSON message with no extra arguments', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessageBatch');
            return inst.sendMessages([{bar: 'baz'}, {bar1: 'baz1'}]).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    Entries: [
                        {Id: '0', MessageBody: '{"bar":"baz"}'},
                        {Id: '1', MessageBody: '{"bar1":"baz1"}'},
                    ],
                });
            });
        });
        it('sends a single message with delay and attributes', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessageBatch');
            return inst.sendMessages('bar', 10, {baz: 'fizz'}).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    Entries: [{
                        Id: '0',
                        MessageBody: 'bar',
                        DelaySeconds: 10,
                        MessageAttributes: {baz: {StringValue: 'fizz', DataType: 'String'}},
                    }],
                });
            });
        });
        it('sends multiple messages with delay and single attributes object', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessageBatch');
            return inst.sendMessages(['bar', 'baz'], 10, {
                baz: 'fizz', FIFO_MessageGroupId: 'groupId',
                FIFO_MessageDeduplicationId: 'dedupId',
            }).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    Entries: [{
                        Id: '0',
                        MessageBody: 'bar',
                        MessageDeduplicationId: 'dedupId',
                        MessageGroupId: 'groupId',
                        DelaySeconds: 10,
                        MessageAttributes: {baz: {StringValue: 'fizz', DataType: 'String'}},
                    }, {
                        Id: '1',
                        MessageBody: 'baz',
                        MessageDeduplicationId: 'dedupId',
                        MessageGroupId: 'groupId',
                        DelaySeconds: 10,
                        MessageAttributes: {baz: {StringValue: 'fizz', DataType: 'String'}},
                    }],
                });
            });
        });
        it('sends multiple gzip messages with delay and single attributes object', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo', gzip: true,
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessageBatch');
            return inst.sendMessages(['bar', 'baz'], 10, {
                baz: 'fizz', FIFO_MessageGroupId: 'groupId',
                FIFO_MessageDeduplicationId: 'dedupId',
            }).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    Entries: [{
                        Id: '0',
                        MessageBody: 'CwGAYmFyAw==',
                        MessageDeduplicationId: 'dedupId',
                        MessageGroupId: 'groupId',
                        DelaySeconds: 10,
                        MessageAttributes: {
                            baz: {StringValue: 'fizz', DataType: 'String'},
                            __SQS_GZIP__: {DataType: 'Number', StringValue: '1'},
                        },
                    }, {
                        Id: '1',
                        MessageBody: 'CwGAYmF6Aw==',
                        MessageDeduplicationId: 'dedupId',
                        MessageGroupId: 'groupId',
                        DelaySeconds: 10,
                        MessageAttributes: {
                            baz: {StringValue: 'fizz', DataType: 'String'},
                            __SQS_GZIP__: {DataType: 'Number', StringValue: '1'},
                        },
                    }],
                });
            });
        });
        it('sends multiple messages with delay and multiple attributes objects', () => {
            const sqsStub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: sqsStub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(sqsStub, 'sendMessageBatch');
            return inst.sendMessages(['bar', 'baz'], 10, [{
                baz: 'fizz', FIFO_MessageGroupId: 'groupId',
                FIFO_MessageDeduplicationId: 'dedupId',
            }, {
                baz1: 'fizz1', FIFO_MessageGroupId: 'groupId1',
                FIFO_MessageDeduplicationId: 'dedupId1',
            }]).then(() => {
                spy.should.be.calledOnce();
                spy.should.be.calledWith({
                    QueueUrl: 'foo',
                    Entries: [{
                        Id: '0',
                        MessageBody: 'bar',
                        DelaySeconds: 10,
                        MessageDeduplicationId: 'dedupId',
                        MessageGroupId: 'groupId',
                        MessageAttributes: {baz: {StringValue: 'fizz', DataType: 'String'}},
                    }, {
                        Id: '1',
                        MessageBody: 'baz',
                        DelaySeconds: 10,
                        MessageDeduplicationId: 'dedupId1',
                        MessageGroupId: 'groupId1',
                        MessageAttributes: {baz1: {StringValue: 'fizz1', DataType: 'String'}},
                    }],
                });
            });
        });
        it('sends multiple batches of messages and merges successes', () => {
            const stub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: stub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(stub, 'sendMessageBatch');
            const msgs = 'a.b.c.d.e.f.g.h.i.j.k.l.m.n.o'.split('.');
            return inst.sendMessages(msgs).then((res: SendMessageBatchResponse) => {
                spy.should.be.calledTwice();
                stub.msgs.length.should.equal(15);
                res.should.have.property('Successful').with.length(15);
                res.should.have.property('Failed').with.length(0);
            });
        });
        it('sends multiple batches of messages and merges successes with batch size is too big', () => {
            const stub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: stub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(stub, 'sendMessageBatch');
            const msgs = 'a.b.c.d.e.f.g.h.i.j.k.l.m.n.o'.split('.');
            msgs.unshift(generateLargeMessage(300));
            return inst.sendMessages(msgs).then((res: SendMessageBatchResponse) => {
                spy.should.be.calledThrice();
                stub.msgs.length.should.equal(16);
                res.should.have.property('Successful').with.length(16);
                res.should.have.property('Failed').with.length(0);
            });
        });
        it('sends multiple batches of messages and merges failures', () => {
            const stub = new SQSStub();
            inst = new SquissPatched({
                S3: getS3Stub,
                SQS: stub, queueUrl: 'foo',
                messageGzip: testMessageGzip,
            });
            const spy = sinon.spy(stub, 'sendMessageBatch');
            const msgs = 'a.FAIL.c.d.e.f.g.h.i.j.k.l.m.n.FAIL'.split('.');
            return inst.sendMessages(msgs).then((res: SendMessageBatchResponse) => {
                spy.should.be.calledTwice();
                stub.msgs.length.should.equal(13);
                res.should.have.property('Successful').with.length(13);
                res.should.have.property('Failed').with.length(2);
            });
        });
    });
    describe('auto-extensions', () => {
        it('initializes a TimeoutExtender', () => {
            _inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(), queueUrl: 'foo', autoExtendTimeout: true,
                messageGzip: testMessageGzip,
            });
            return _inst.start().then(() => {
                should.exist(_inst._timeoutExtender);
                _inst._timeoutExtender!.should.not.equal(null);
                _inst._timeoutExtender!._opts.visibilityTimeoutSecs!.should.equal(31);
                _inst._timeoutExtender!._opts.noExtensionsAfterSecs!.should.equal(43200);
                _inst._timeoutExtender!._opts.advancedCallMs!.should.equal(5000);
            });
        });
        it('constructs a TimeoutExtender with custom options', () => {
            _inst = new SquissPatched({
                S3: getS3Stub,
                SQS: new SQSStub(),
                queueUrl: 'foo',
                autoExtendTimeout: true,
                visibilityTimeoutSecs: 53,
                noExtensionsAfterSecs: 400,
                advancedCallMs: 4500,
                messageGzip: testMessageGzip,
            });
            return _inst.start().then(() => {
                should.exist(_inst._timeoutExtender);
                _inst._timeoutExtender!.should.not.equal(null);
                _inst._timeoutExtender!._opts.visibilityTimeoutSecs!.should.equal(53);
                _inst._timeoutExtender!._opts.noExtensionsAfterSecs!.should.equal(400);
                _inst._timeoutExtender!._opts.advancedCallMs!.should.equal(4500);
            });
        });
    });
});
