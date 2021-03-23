import {SquissStub} from '../stubs/SquissStub';
import {Blobs, S3Stub} from '../stubs/S3Stub';
import delay from 'delay';
import {SQSMessage} from '../../types/SQSFacade';
import {testMessageGzip} from '../stubs/identityGzipUtils';
import {Message} from '../../impl/Message';
import {IMessage} from '../../types/IMessage';
import {ISquiss} from '../../types/ISquiss';

const wait = (ms?: number) => delay(ms === undefined ? 20 : ms);

const getSquissStub = () => {
    return new SquissStub();
};

const getS3Stub = (blobs?: Blobs) => {
    const stub = new S3Stub(blobs);
    return () => stub;
};

function getSQSMsg(body?: string): SQSMessage {
    return {
        MessageId: 'msgId',
        ReceiptHandle: 'handle',
        MD5OfBody: 'abcdeabcdeabcdeabcdeabcdeabcde12',
        Body: body,
        MessageAttributes: {
            SomeNumber: {
                DataType: 'Number',
                StringValue: '1',
            },
            SomeString: {
                DataType: 'String',
                StringValue: 's',
            },
            SomeBinary: {
                DataType: 'Binary',
                BinaryValue: Buffer.from(['s'.charCodeAt(0)]),
            },
            SomeCustomBinary: {
                DataType: 'CustomBinary',
                BinaryValue: Buffer.from(['c'.charCodeAt(0)]),
            },
        },
    };
}

const validateMessage = (msg: IMessage) => () => {
    msg.should.have.property('body');
    msg.body.should.be.an('object');
    msg.body.should.have.property('i').equal(1);
}

const snsMsg = {
    Type: 'Notification',
    MessageId: 'some-id',
    TopicArn: 'arn:aws:sns:us-east-1:1234567890:sns-topic-name',
    Subject: 'some-subject',
    Message: 'foo',
    Timestamp: '2015-11-25T04:17:37.741Z',
    SignatureVersion: '1',
    Signature: 'dGVzdAo=',
    SigningCertURL: 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-bb750dd426d95ee9390147a5624348ee.pem',
    UnsubscribeURL: 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:1234567890:sns-topic-name:12345678-1234-4321-1234-123456789012',
};

describe('Message', () => {
    it('unwraps an SNS message', () => {
        const msg = new Message({
            squiss: getSquissStub(),
            msg: getSQSMsg(JSON.stringify(snsMsg)),
            unwrapSns: true,
            bodyFormat: 'plain',
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        msg.should.have.property('body').equal('foo');
        msg.should.have.property('subject').equal('some-subject');
        msg.should.have.property('topicArn').equal(snsMsg.TopicArn);
        msg.should.have.property('topicName').equal('sns-topic-name');
    });
    it('unwraps an SNS message with empty body', () => {
        const msg = new Message({
            squiss: getSquissStub(),
            msg: getSQSMsg(''),
            unwrapSns: true,
            bodyFormat: 'plain',
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        msg.should.have.property('body').equal(undefined);
        msg.should.have.property('subject').equal(undefined);
        msg.should.have.property('topicArn').equal(undefined);
    });
    it('parses JSON', () => {
        const msg = new Message({
            squiss: getSquissStub(),
            msg: getSQSMsg('{"Message":"foo","bar":"baz"}'),
            bodyFormat: 'json',
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.parse()
            .then(() => {
                msg.should.have.property('body');
                msg.body.should.be.an('object');
                msg.body.should.have.property('Message').equal('foo');
                msg.body.should.have.property('bar').equal('baz');
                msg.attributes.should.be.eql({
                    SomeNumber: 1,
                    SomeString: 's',
                    SomeBinary: Buffer.from(['s'.charCodeAt(0)]),
                    SomeCustomBinary: Buffer.from(['c'.charCodeAt(0)]),
                });
            });
    });
    it('parses S3 JSON', () => {
        const bucket = 'my_bucket';
        const key = 'my_key';
        const blobs: Blobs = {};
        blobs[bucket] = {};
        blobs[bucket][key] = '{"i": 1}';
        const rawMsg = getSQSMsg(JSON.stringify({bucket, key}));
        rawMsg.MessageAttributes!.__SQS_S3__ = {
            DataType: 'Number',
            StringValue: '1',
        };
        const msg = new Message({
            squiss: getSquissStub(),
            msg: rawMsg,
            bodyFormat: 'json',
            s3Retriever: getS3Stub(blobs),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.parse()
            .then(validateMessage(msg));
    });
    it('parses gzipped JSON', () => {
        const rawMsg = getSQSMsg('iwOAeyJpIjogMX0D');
        rawMsg.MessageAttributes!.__SQS_GZIP__ = {
            DataType: 'Number',
            StringValue: '1',
        };
        const msg = new Message({
            squiss: getSquissStub(),
            msg: rawMsg,
            bodyFormat: 'json',
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.parse()
            .then(validateMessage(msg));
    });
    it('parses gzipped S3 JSON', () => {
        const bucket = 'my_bucket';
        const key = 'my_key';
        const blobs: Blobs = {};
        blobs[bucket] = {};
        blobs[bucket][key] = 'iwOAeyJpIjogMX0D';
        const rawMsg = getSQSMsg(JSON.stringify({bucket, key}));
        rawMsg.MessageAttributes!.__SQS_S3__ = {
            DataType: 'Number',
            StringValue: '1',
        };
        rawMsg.MessageAttributes!.__SQS_GZIP__ = {
            DataType: 'Number',
            StringValue: '1',
        };
        const msg = new Message({
            squiss: getSquissStub(),
            msg: rawMsg,
            bodyFormat: 'json',
            s3Retriever: getS3Stub(blobs),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.parse()
            .then(validateMessage(msg));
    });
    it('parses gzipped plain', () => {
        const rawMsg = getSQSMsg('iwOAeyJpIjogMX0D');
        rawMsg.MessageAttributes!.__SQS_GZIP__ = {
            DataType: 'Number',
            StringValue: '1',
        };
        const msg = new Message({
            squiss: getSquissStub(),
            msg: rawMsg,
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.parse()
            .then(() => {
                msg.should.have.property('body');
                msg.body.should.eql('{"i": 1}');
            });
    });
    it('not parse empty gzipped body', () => {
        const rawMsg = getSQSMsg();
        rawMsg.MessageAttributes!.__SQS_GZIP__ = {
            DataType: 'Number',
            StringValue: '1',
        };
        const msg = new Message({
            squiss: getSquissStub(),
            msg: rawMsg,
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.parse()
            .then(() => {
                msg.should.have.property('body').equals(undefined);
            });
    });
    it('parses empty string as json', () => {
        const msg = new Message({
            squiss: getSquissStub(),
            msg: getSQSMsg(''),
            bodyFormat: 'json',
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.parse()
            .then(() => {
                msg.should.have.property('body');
                msg.body.should.be.an('object');
            });
    });
    it('not parse empty body', () => {
        const msg = new Message({
            squiss: getSquissStub(),
            msg: getSQSMsg(),
            bodyFormat: 'json',
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.parse()
            .then(() => {
                msg.should.have.property('body').equal(undefined);
            });
    });
    it('removes S3 on delete', (done) => {
        const bucket = 'my_bucket';
        const key = 'my_key';
        const uploadSize = 50;
        const blobs: Blobs = {};
        blobs[bucket] = {};
        blobs[bucket][key] = '{"i": 1}';
        const rawMsg = getSQSMsg(JSON.stringify({bucket, key, uploadSize}));
        rawMsg.MessageAttributes!.__SQS_S3__ = {
            DataType: 'Number',
            StringValue: '1',
        };
        let squissS3DeleteEventEmitted = false;
        let squissS3DownloadEventEmitted = false;
        let msgS3DeleteEventEmitted = false;
        let msgS3DownloadEventEmitted = false;
        const msg = new Message({
            squiss: {
                deleteMessage: (toDel: Message) => {
                    blobs[bucket].should.not.have.property(key);
                    toDel.should.equal(msg);
                    squissS3DeleteEventEmitted.should.eql(true);
                    msgS3DeleteEventEmitted.should.eql(true);
                    squissS3DownloadEventEmitted.should.eql(true);
                    msgS3DownloadEventEmitted.should.eql(true);
                    done();
                },
                emit: (event: string, data: any) => {
                    console.log(event);
                    data.data.bucket.should.eql(bucket);
                    data.data.key.should.eql(key);
                    data.data.uploadSize.should.eql(uploadSize);
                    data.message.should.eql(msg);
                    squissS3DeleteEventEmitted = squissS3DeleteEventEmitted || event === 's3Delete';
                    squissS3DownloadEventEmitted = squissS3DownloadEventEmitted || event === 's3Download';
                },
            } as ISquiss,
            msg: rawMsg,
            bodyFormat: 'json',
            s3Retriever: getS3Stub(blobs),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        msg.on('s3Delete', (data) => {
            data.bucket.should.eql(bucket);
            data.key.should.eql(key);
            data.uploadSize.should.eql(uploadSize);
            msgS3DeleteEventEmitted = true;
        });
        msg.on('s3Download', (data) => {
            data.bucket.should.eql(bucket);
            data.key.should.eql(key);
            data.uploadSize.should.eql(uploadSize);
            msgS3DownloadEventEmitted = true;
        });
        msg.parse()
            .then(() => {
                validateMessage(msg)();
                msg.del();
            });
    });
    it('does not removes S3 on delete when s3Retain is set', (done) => {
        const bucket = 'my_bucket';
        const key = 'my_key';
        const blobs: Blobs = {};
        blobs[bucket] = {};
        blobs[bucket][key] = '{"i": 1}';
        const rawMsg = getSQSMsg(JSON.stringify({bucket, key}));
        rawMsg.MessageAttributes!.__SQS_S3__ = {
            DataType: 'Number',
            StringValue: '1',
        };
        let squissS3DeleteEventEmitted = false;
        let squissS3DownloadEventEmitted = false;
        let msgS3DeleteEventEmitted = false;
        let msgS3DownloadEventEmitted = false;
        const msg = new Message({
            squiss: {
                deleteMessage: (toDel: Message) => {
                    blobs[bucket].should.have.property(key);
                    toDel.should.equal(msg);
                    squissS3DeleteEventEmitted.should.eql(false);
                    msgS3DeleteEventEmitted.should.eql(false);
                    squissS3DownloadEventEmitted.should.eql(true);
                    msgS3DownloadEventEmitted.should.eql(true);
                    done();
                },
                emit: (event: string, data: any) => {
                    squissS3DeleteEventEmitted = squissS3DeleteEventEmitted || event === 's3Delete';
                    squissS3DownloadEventEmitted = squissS3DownloadEventEmitted || event === 's3Download';
                },
            } as ISquiss,
            msg: rawMsg,
            bodyFormat: 'json',
            s3Retriever: getS3Stub(blobs),
            s3Retain: true,
            messageGzip: testMessageGzip,
        });
        msg.on('s3Delete', () => {
            msgS3DeleteEventEmitted = true;
        });
        msg.on('s3Download', () => {
            msgS3DownloadEventEmitted = true;
        });
        msg.parse()
            .then(() => {
                validateMessage(msg)();
                msg.del();
            });
    });
    it('calls Squiss.deleteMessage on delete', (done) => {
        const msg = new Message({
            msg: getSQSMsg('{"Message":"foo","bar":"baz"}'),
            bodyFormat: 'json',
            squiss: {
                deleteMessage: (toDel: Message) => {
                    toDel.should.equal(msg);
                    done();
                },
            } as ISquiss,
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        msg.del();
    });
    it('should not mark as handled if failed to delete message', () => {
        const msg = new Message({
            msg: getSQSMsg('{"Message":"foo","bar":"baz"}'),
            bodyFormat: 'json',
            squiss: {
                deleteMessage: (toDel: Message) => {
                    return Promise.reject();
                },
            } as ISquiss,
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.del()
            .then(() => {
                msg.isHandled().should.eql(false);
            });
    });
    it('should not mark as handled if failed to release message', () => {
        const msg = new Message({
            msg: getSQSMsg('{"Message":"foo","bar":"baz"}'),
            bodyFormat: 'json',
            squiss: {
                releaseMessage: (toDel: Message) => {
                    return Promise.reject();
                },
            } as ISquiss,
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        return msg.release()
            .then(() => {
                msg.isHandled().should.eql(false);
            });
    });
    it('calls Squiss.handledMessage on keep', (done) => {
        const msg = new Message({
            msg: getSQSMsg('{"Message":"foo","bar":"baz"}'),
            bodyFormat: 'json',
            squiss: {
                handledMessage: (_msg: Message) => {
                    done()
                },
            } as ISquiss,
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        msg.keep();
    });
    it('treats del(), keep(), and release() as idempotent', () => {
        let calls = 0;
        const msg = new Message({
            msg: getSQSMsg('{"Message":"foo","bar":"baz"}'),
            bodyFormat: 'json',
            squiss: {
                deleteMessage: () => {
                    calls += 1;
                },
                handledMessage: () => {
                    calls += 10;
                },
                releaseMessage: () => {
                    calls += 100;
                },
            } as any as ISquiss,
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        msg.del();
        msg.keep();
        msg.release();
        msg.del();
        return wait()
            .then(() => {
                calls.should.equal(1);
            });
    });
    it('calls Squiss.changeMessageVisibility on changeVisibility', (done) => {
        const timeout = 10;
        const message = new Message({
            msg: getSQSMsg('{"Message":"foo","bar":"baz"}'),
            bodyFormat: 'json',
            squiss: {
                changeMessageVisibility: (msg: Message, timeoutInSeconds: number) => {
                    msg.should.be.eql(message);
                    timeoutInSeconds.should.be.eql(timeout);
                    done();
                },
            } as any as ISquiss,
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        message.changeVisibility(timeout);
    });
    it('calls Squiss.releaseMessage on release', (done) => {
        const message = new Message({
            msg: getSQSMsg('{"Message":"foo","bar":"baz"}'),
            bodyFormat: 'json',
            squiss: {
                releaseMessage: (msg: Message) => {
                    msg.should.eql(message);
                    return Promise.resolve();
                },
            } as any as ISquiss,
            s3Retriever: getS3Stub(),
            s3Retain: false,
            messageGzip: testMessageGzip,
        });
        message.release()
            .then(() => {
                done();
            });
    });
});
