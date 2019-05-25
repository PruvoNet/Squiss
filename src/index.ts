'use strict';

import * as AWS from 'aws-sdk';
import * as url from 'url';
import {EventEmitter} from 'events';
import {Message} from './Message';
import {ITimeoutExtenderOptions, TimeoutExtender} from './TimeoutExtender';
import {createMessageAttributes, IMessageAttributes} from './attributeUtils';
import {isString} from 'ts-type-guards';
import {SQS, S3} from 'aws-sdk';
import {GZIP_MARKER, compressMessage} from './gzipUtils';
import {S3_MARKER, uploadBlob} from './s3Utils';
import {getMessageSize} from './messageSizeUtils';
import {BatchResultErrorEntry} from 'aws-sdk/clients/sqs';
import {AWSError} from 'aws-sdk';
import {StrictEventEmitter} from './EventEmitterTypesHelper';

export {SQS, S3} from 'aws-sdk';

const AWS_MAX_SEND_BATCH = 10;

export interface IObject {
    [k: string]: any;
}

export type IMessageToSend = IObject | string;

export {IMessageAttributes} from './attributeUtils';
export {Message} from './Message';

export type BodyFormat = 'json' | 'plain' | undefined;

export interface ISquissOptions {
    receiveBatchSize?: number;
    receiveAttributes?: string[];
    receiveSqsAttributes?: string[];
    minReceiveBatchSize?: number;
    receiveWaitTimeSecs?: number;
    deleteBatchSize?: number;
    deleteWaitMs?: number;
    maxInFlight?: number;
    unwrapSns?: boolean;
    bodyFormat?: BodyFormat;
    correctQueueUrl?: boolean;
    pollRetryMs?: number;
    activePollIntervalMs?: number;
    idlePollIntervalMs?: number;
    delaySecs?: number;
    gzip?: boolean;
    minGzipSize?: number;
    maxMessageBytes?: number;
    messageRetentionSecs?: number;
    autoExtendTimeout?: boolean;
    SQS?: SQS | typeof SQS;
    S3?: S3 | typeof S3;
    awsConfig?: SQS.Types.ClientConfiguration;
    queueUrl?: string;
    queueName?: string;
    visibilityTimeoutSecs?: number;
    queuePolicy?: string;
    accountNumber?: string | number;
    noExtensionsAfterSecs?: number;
    advancedCallMs?: number;
    s3Fallback?: boolean;
    s3Bucket?: string;
    s3Retain?: boolean;
    s3Prefix?: string;
    minS3Size?: number;
}

interface IDeleteQueueItem {
    msg: Message;
    Id: string;
    ReceiptHandle: string;
    resolve: () => void;
    reject: (reason?: any) => void;
}

interface IDeleteQueueItemById {
    [k: string]: IDeleteQueueItem;
}

export interface ISendMessageRequest {
    MessageBody: string;
    DelaySeconds?: number;
    MessageAttributes?: SQS.MessageBodyAttributeMap;
    MessageDeduplicationId?: string;
    MessageGroupId?: string;
}

const optDefaults: ISquissOptions = {
    receiveBatchSize: 10,
    receiveAttributes: ['All'],
    receiveSqsAttributes: ['All'],
    minReceiveBatchSize: 1,
    receiveWaitTimeSecs: 20,
    deleteBatchSize: 10,
    deleteWaitMs: 2000,
    maxInFlight: 100,
    unwrapSns: false,
    bodyFormat: 'plain',
    correctQueueUrl: false,
    pollRetryMs: 2000,
    activePollIntervalMs: 0,
    idlePollIntervalMs: 0,
    delaySecs: 0,
    gzip: false,
    minGzipSize: 0,
    s3Fallback: false,
    s3Retain: false,
    s3Prefix: '',
    maxMessageBytes: 262144,
    messageRetentionSecs: 345600,
    autoExtendTimeout: false,
};

export interface IMessageDeletedEventPayload {
    msg: Message;
    successId: string;
}

export interface IMessageErrorEventPayload {
    message: Message;
    error: AWSError;
}

export interface IMessageDeleteErrorEventPayload {
    message: Message;
    error: BatchResultErrorEntry;
}

interface ISquissEvents {
    delQueued: Message;
    handled: Message;
    released: Message;
    timeoutReached: Message;
    extendingTimeout: Message;
    timeoutExtended: Message;
    message: Message;
    keep: Message;
    drained: void;
    queueEmpty: void;
    maxInFlight: void;
    deleted: IMessageDeletedEventPayload;
    gotMessages: number;
    error: Error;
    aborted: AWSError;
    delError: IMessageDeleteErrorEventPayload;
    autoExtendFail: IMessageErrorEventPayload;
    autoExtendError: IMessageErrorEventPayload;
}

type SquissEmitter = StrictEventEmitter<EventEmitter, ISquissEvents>;

export class Squiss extends (EventEmitter as new() => SquissEmitter) {

    public get inFlight(): number {
        return this._inFlight;
    }

    public get running(): boolean {
        return this._running;
    }

    public sqs: SQS;
    public _timeoutExtender: TimeoutExtender | undefined;
    public _opts: ISquissOptions;
    private _s3?: S3;
    private _running: boolean;
    private _paused: boolean;
    private _inFlight: number;
    private _queueVisibilityTimeout: number;
    private _queueMaximumMessageSize: number;
    private _queueUrl: string;
    private _delQueue: Map<string, IDeleteQueueItem>;
    private _delTimer: number | undefined;
    private _activeReq: AWS.Request<SQS.Types.ReceiveMessageResult, AWS.AWSError> | undefined;

    constructor(opts?: ISquissOptions | undefined) {
        super();
        this._opts = Object.assign({}, optDefaults, opts || {});
        if (this._opts.SQS) {
            if (typeof this._opts.SQS === 'function') {
                this.sqs = new this._opts.SQS(this._opts.awsConfig);
            } else {
                this.sqs = this._opts.SQS;
            }
        } else {
            this.sqs = new SQS(this._opts.awsConfig);
        }
        this._opts.deleteBatchSize = Math.min(this._opts.deleteBatchSize!, 10);
        this._opts.receiveBatchSize = Math.min(this._opts.receiveBatchSize!,
            this._opts.maxInFlight! > 0 ? this._opts.maxInFlight! : 10, 10);
        this._opts.minReceiveBatchSize = Math.min(this._opts.minReceiveBatchSize!, this._opts.receiveBatchSize);
        this._running = false;
        this._inFlight = 0;
        this._delQueue = new Map();
        this._paused = true;
        this._delTimer = undefined;
        this._queueUrl = this._opts.queueUrl || '';
        this._queueVisibilityTimeout = 0;
        this._queueMaximumMessageSize = 0;
        if (!this._opts.queueUrl && !this._opts.queueName) {
            throw new Error('Squiss requires either the "queueUrl", or the "queueName".');
        }
        if (this._opts.s3Fallback && !this._opts.s3Bucket) {
            throw new Error('Squiss requires "s3Bucket" to be defined is using s3 fallback');
        }
        this._timeoutExtender = undefined;
    }

    public changeMessageVisibility(msg: Message | string, timeoutInSeconds: number): Promise<void> {
        let receiptHandle: string;
        if (msg instanceof Message) {
            receiptHandle = msg.raw.ReceiptHandle!;
        } else {
            receiptHandle = msg;
        }
        return this.getQueueUrl()
            .then((queueUrl) => {
                    return this.sqs.changeMessageVisibility({
                        QueueUrl: queueUrl,
                        ReceiptHandle: receiptHandle,
                        VisibilityTimeout: timeoutInSeconds,
                    }).promise();
                }
            )
            .then(() => {
                return Promise.resolve();
            });
    }

    public createQueue(): Promise<string> {
        if (!this._opts.queueName) {
            return Promise.reject(new Error('Squiss was not instantiated with a queueName'));
        }
        const params: SQS.Types.CreateQueueRequest = {
            QueueName: this._opts.queueName,
            Attributes: {
                ReceiveMessageWaitTimeSeconds: this._opts.receiveWaitTimeSecs!.toString(),
                DelaySeconds: this._opts.delaySecs!.toString(),
                MaximumMessageSize: this._opts.maxMessageBytes!.toString(),
                MessageRetentionPeriod: this._opts.messageRetentionSecs!.toString(),
            },
        };
        if (this._opts.visibilityTimeoutSecs) {
            params.Attributes!.VisibilityTimeout = this._opts.visibilityTimeoutSecs.toString();
        }
        if (this._opts.queuePolicy) {
            params.Attributes!.Policy = this._opts.queuePolicy;
        }
        return this.sqs.createQueue(params).promise().then((res) => {
            this._queueUrl = res.QueueUrl!;
            return res.QueueUrl!;
        });
    }

    public deleteMessage(msg: Message): Promise<void> {
        if (!msg.raw) {
            return Promise.reject(new Error('Squiss.deleteMessage requires a Message object'));
        }
        const promise = new Promise<void>((resolve, reject) => {
            this._delQueue.set(msg.raw.MessageId!,
                {msg, Id: msg.raw.MessageId!, ReceiptHandle: msg.raw.ReceiptHandle!, resolve, reject});
        });
        msg.emit('delQueued');
        this.emit('delQueued', msg);
        this.handledMessage(msg);
        if (this._delQueue.size >= this._opts.deleteBatchSize!) {
            if (this._delTimer) {
                clearTimeout(this._delTimer);
                this._delTimer = undefined;
            }
            const delQueue = this._delQueue;
            const iterator = delQueue.entries();
            const delBatch = Array.from({length: this._opts.deleteBatchSize!}, function(this: typeof iterator) {
                const element = this.next().value;
                delQueue.delete(element[0]);
                return element[1];
            }, iterator);
            this._deleteMessages(delBatch);
        } else if (!this._delTimer) {
            this._delTimer = setTimeout(() => {
                this._delTimer = undefined;
                const delQueue = this._delQueue;
                const iterator = delQueue.entries();
                const delBatch = Array.from({length: delQueue.size}, function(this: typeof iterator) {
                    const element = this.next().value;
                    delQueue.delete(element[0]);
                    return element[1];
                }, iterator);
                this._deleteMessages(delBatch);
            }, this._opts.deleteWaitMs);
        }
        return promise;
    }

    public deleteQueue(): Promise<void> {
        return this.getQueueUrl()
            .then((queueUrl) => {
                return this.sqs.deleteQueue({QueueUrl: queueUrl}).promise();
            })
            .then(() => {
                return Promise.resolve();
            });
    }

    public getQueueUrl(): Promise<string> {
        if (this._queueUrl) {
            return Promise.resolve(this._queueUrl);
        }
        const params: SQS.Types.GetQueueUrlRequest = {QueueName: this._opts.queueName!};
        if (this._opts.accountNumber) {
            params.QueueOwnerAWSAccountId = this._opts.accountNumber.toString();
        }
        return this.sqs.getQueueUrl(params).promise().then((data) => {
            this._queueUrl = data.QueueUrl!;
            if (this._opts.correctQueueUrl) {
                const newUrl = url.parse(this.sqs.config.endpoint!);
                const parsedQueueUrl = url.parse(this._queueUrl);
                newUrl.pathname = parsedQueueUrl.pathname;
                this._queueUrl = url.format(newUrl);
            }
            return this._queueUrl;
        });
    }

    public getQueueVisibilityTimeout(): Promise<number> {
        if (this._queueVisibilityTimeout) {
            return Promise.resolve(this._queueVisibilityTimeout);
        }
        return this.getQueueUrl().then((queueUrl) => {
            return this.sqs.getQueueAttributes({
                AttributeNames: ['VisibilityTimeout'],
                QueueUrl: queueUrl,
            }).promise();
        }).then((res) => {
            if (!res.Attributes || !res.Attributes.VisibilityTimeout) {
                throw new Error('SQS.GetQueueAttributes call did not return expected shape. Response: ' +
                    JSON.stringify(res));
            }
            this._queueVisibilityTimeout = parseInt(res.Attributes.VisibilityTimeout, 10);
            return this._queueVisibilityTimeout;
        });
    }

    public getQueueMaximumMessageSize(): Promise<number> {
        if (this._queueMaximumMessageSize) {
            return Promise.resolve(this._queueMaximumMessageSize);
        }
        return this.getQueueUrl().then((queueUrl) => {
            return this.sqs.getQueueAttributes({
                AttributeNames: ['MaximumMessageSize'],
                QueueUrl: queueUrl,
            }).promise();
        }).then((res) => {
            if (!res.Attributes || !res.Attributes.MaximumMessageSize) {
                throw new Error('SQS.GetQueueAttributes call did not return expected shape. Response: ' +
                    JSON.stringify(res));
            }
            this._queueMaximumMessageSize = parseInt(res.Attributes.MaximumMessageSize, 10);
            return this._queueMaximumMessageSize;
        });
    }

    public handledMessage(msg: Message): void {
        this._inFlight--;
        if (this._paused && this._slotsAvailable()) {
            this._paused = false;
            this._startPoller();
        }
        msg.emit('handled');
        this.emit('handled', msg);
        if (!this._inFlight) {
            this.emit('drained');
        }
    }

    public releaseMessage(msg: Message): Promise<void> {
        this.handledMessage(msg);
        return this.changeMessageVisibility(msg, 0).then((res) => {
            msg.emit('released');
            this.emit('released', msg);
            return res;
        });
    }

    public purgeQueue(): Promise<void> {
        return this.getQueueUrl()
            .then((queueUrl) => {
                return this.sqs.purgeQueue({QueueUrl: queueUrl}).promise();
            })
            .then(() => {
                this._inFlight = 0;
                this._delQueue = new Map();
                this._delTimer = undefined;
                return Promise.resolve();
            });
    }

    public sendMessage(message: IMessageToSend, delay?: number, attributes?: IMessageAttributes)
        : Promise<SQS.Types.SendMessageResult> {
        return Promise.all([
            this.perpareMessageRequest(message, delay, attributes),
            this.getQueueUrl(),
        ])
            .then((data) => {
                const rawParams = data[0];
                const queueUrl = data[1];
                const params: SQS.Types.SendMessageRequest = {
                    QueueUrl: queueUrl,
                    ...rawParams,
                };
                return this.sqs.sendMessage(params).promise();
            });
    }

    public sendMessages(messages: IMessageToSend[] | IMessageToSend, delay?: number,
                        attributes?: IMessageAttributes | IMessageAttributes[])
        : Promise<SQS.Types.SendMessageBatchResult> {
        const batches: ISendMessageRequest[][] = [];
        const msgs: IMessageToSend[] = Array.isArray(messages) ? messages : [messages];
        const promises: Array<Promise<ISendMessageRequest>> = [];
        msgs.forEach((msg, i) => {
            let currentAttributes: IMessageAttributes | undefined;
            if (attributes) {
                if (!Array.isArray(attributes)) {
                    currentAttributes = attributes;
                } else {
                    currentAttributes = attributes[i];
                }
            }
            promises.push(this.perpareMessageRequest(msg, delay, currentAttributes));
        });
        return Promise.all([this.getQueueMaximumMessageSize(), Promise.all(promises)])
            .then((results) => {
                const queueMaximumMessageSize = results[0];
                const messageRequests = results[1];
                let currentBatchSize = 0;
                let currentBatchLength = 0;
                messageRequests.forEach((message) => {
                    const messageSize = getMessageSize(message);
                    if (currentBatchLength % AWS_MAX_SEND_BATCH === 0 ||
                        currentBatchSize + messageSize >= queueMaximumMessageSize) {
                        currentBatchLength = 0;
                        currentBatchSize = 0;
                        batches.push([]);
                    }
                    currentBatchSize += messageSize;
                    currentBatchLength++;
                    batches[batches.length - 1].push(message);
                });
                return Promise.all(batches.map((batch, idx) => {
                    return this._sendMessageBatch(batch, delay, idx * AWS_MAX_SEND_BATCH);
                }));
            })
            .then((results) => {
                const merged: SQS.Types.SendMessageBatchResult = {Successful: [], Failed: []};
                results.forEach((res) => {
                    res.Successful.forEach((elem) => merged.Successful.push(elem));
                    res.Failed.forEach((elem) => merged.Failed.push(elem));
                });
                return merged;
            });
    }

    public start(): Promise<void> {
        if (this._running) {
            return Promise.resolve();
        }
        this._running = true;
        return this._startPoller();
    }

    public stop(soft?: boolean, timeout?: number): Promise<boolean> {
        if (!soft && this._activeReq) {
            this._activeReq.abort();
        }
        this._running = false;
        this._paused = false;
        if (!this._inFlight) {
            return Promise.resolve(true);
        }
        const scope = this;
        return new Promise((resolve) => {
            let resolved = false;
            let timer: NodeJS.Timeout | undefined;
            scope.on('drained', () => {
                if (!resolved) {
                    resolved = true;
                    if (timer) {
                        clearTimeout(timer);
                        timer = undefined;
                    }
                    resolve(true);
                }
            });
            if (timeout) {
                timer = setTimeout(() => {
                    resolved = true;
                    resolve(false);
                }, timeout);
            }
        });
    }

    public _deleteMessages(batch: IDeleteQueueItem[]): Promise<void> {
        const itemById: IDeleteQueueItemById = batch.reduce((prevByValue, item) => {
            prevByValue[item.Id] = item;
            return prevByValue;
        }, {} as IDeleteQueueItemById);
        return this.getQueueUrl().then((queueUrl) => {
            return this.sqs.deleteMessageBatch({
                QueueUrl: queueUrl,
                Entries: batch.map((item) => {
                    return {
                        Id: item.Id,
                        ReceiptHandle: item.ReceiptHandle,
                    };
                }),
            }).promise();
        }).then((data) => {
            if (data.Failed && data.Failed.length) {
                data.Failed.forEach((fail) => {
                    this.emit('delError', {error: fail, message: itemById[fail.Id].msg});
                    itemById[fail.Id].msg.emit('delError', fail);
                    itemById[fail.Id].reject(fail);
                });
            }
            if (data.Successful && data.Successful.length) {
                data.Successful.forEach((success) => {
                    const msg = itemById[success.Id].msg;
                    this.emit('deleted', {msg, successId: success.Id});
                    msg.emit('deleted', success.Id);
                    itemById[success.Id].resolve();
                });
            }
        }).catch((err: Error) => {
            this.emit('error', err);
            return Promise.reject(err);
        });
    }

    public _emitMessages(messages: SQS.MessageList): void {
        messages.forEach((msg) => {
            const message = new Message({
                squiss: this,
                unwrapSns: this._opts.unwrapSns,
                bodyFormat: this._opts.bodyFormat,
                msg,
                s3Retriever: this.getS3.bind(this),
                s3Retain: this._opts.s3Retain || false,
            });
            this._inFlight++;
            message.parse()
                .then(() => {
                    this.emit('message', message);
                });
        });
    }

    public _getBatch(queueUrl: string): void {
        if (this._activeReq || !this._running) {
            return;
        }
        const next = this._getBatch.bind(this, queueUrl);
        const maxMessagesToGet = !this._opts.maxInFlight ? this._opts.receiveBatchSize! :
            Math.min(this._opts.maxInFlight! - this._inFlight, this._opts.receiveBatchSize!);
        if (maxMessagesToGet < this._opts.minReceiveBatchSize!) {
            this._paused = true;
            return;
        }
        const params: SQS.Types.ReceiveMessageRequest = {
            QueueUrl: queueUrl,
            MaxNumberOfMessages: maxMessagesToGet,
            WaitTimeSeconds: this._opts.receiveWaitTimeSecs,
        };
        params.MessageAttributeNames = this._opts.receiveAttributes;
        params.AttributeNames = this._opts.receiveSqsAttributes;
        if (this._opts.visibilityTimeoutSecs !== undefined) {
            params.VisibilityTimeout = this._opts.visibilityTimeoutSecs;
        }
        this._activeReq = this.sqs.receiveMessage(params);
        this._activeReq.promise().then((data) => {
            let gotMessages = true;
            this._activeReq = undefined;
            if (data && data.Messages) {
                this.emit('gotMessages', data.Messages.length);
                this._emitMessages(data.Messages);
            } else {
                this.emit('queueEmpty');
                gotMessages = false;
            }
            if (this._slotsAvailable()) {
                if (gotMessages && this._opts.activePollIntervalMs) {
                    setTimeout(next, this._opts.activePollIntervalMs);
                } else if (!gotMessages && this._opts.idlePollIntervalMs) {
                    setTimeout(next, this._opts.idlePollIntervalMs);
                } else {
                    next();
                }
            } else {
                this._paused = true;
                this.emit('maxInFlight');
            }
        }).catch((err: AWSError) => {
            this._activeReq = undefined;
            if (err.code && err.code === 'RequestAbortedError') {
                this.emit('aborted', err);
            } else {
                setTimeout(next, this._opts.pollRetryMs);
                this.emit('error', err);
            }
        });
    }

    public _initTimeoutExtender(): Promise<void> {
        if (!this._opts.autoExtendTimeout || this._timeoutExtender) {
            return Promise.resolve();
        }
        return Promise.resolve().then(() => {
            if (this._opts.visibilityTimeoutSecs) {
                return this._opts.visibilityTimeoutSecs;
            }
            return this.getQueueVisibilityTimeout();
        }).then((visibilityTimeoutSecs) => {
            const opts: ITimeoutExtenderOptions = {visibilityTimeoutSecs};
            if (this._opts.noExtensionsAfterSecs) {
                opts.noExtensionsAfterSecs = this._opts.noExtensionsAfterSecs;
            }
            if (this._opts.advancedCallMs) {
                opts.advancedCallMs = this._opts.advancedCallMs;
            }
            this._timeoutExtender = new TimeoutExtender(this, opts);
        });
    }

    public _sendMessageBatch(messages: ISendMessageRequest[], delay: number | undefined, startIndex: number):
        Promise<SQS.Types.SendMessageBatchResult> {
        const start = startIndex || 0;
        return this.getQueueUrl().then((queueUrl) => {
            const params: SQS.Types.SendMessageBatchRequest = {
                QueueUrl: queueUrl,
                Entries: [],
            };
            const promises: Array<Promise<void>> = [];
            messages.forEach((msg, idx) => {
                const entry: SQS.Types.SendMessageBatchRequestEntry = {
                    Id: (start + idx).toString(),
                    ...msg,
                };
                params.Entries.push(entry);
            });
            return Promise.all(promises)
                .then(() => {
                    return this.sqs.sendMessageBatch(params).promise();
                });
        });
    }

    public _slotsAvailable(): boolean {
        return !this._opts.maxInFlight || this._inFlight < this._opts.maxInFlight;
    }

    public _startPoller(): Promise<void> {
        return this._initTimeoutExtender()
            .then(() => this.getQueueUrl())
            .then((queueUrl) => this._getBatch(queueUrl))
            .catch((e: Error) => {
                this.emit('error', e);
            });
    }

    public getS3(): S3 {
        if (this._s3) {
            return this._s3;
        }
        if (this._opts.S3) {
            if (typeof this._opts.S3 === 'function') {
                this._s3 = new this._opts.S3(this._opts.awsConfig);
            } else {
                this._s3 = this._opts.S3;
            }
        } else {
            this._s3 = new S3(this._opts.awsConfig);
        }
        return this._s3;
    }

    private isLargeMessage(message: ISendMessageRequest, minSize?: number): Promise<boolean> {
        const messageSize = getMessageSize(message);
        if (minSize) {
            return Promise.resolve(messageSize > minSize);
        }
        return this.getQueueMaximumMessageSize()
            .then((queueMaximumMessageSize) => {
                return messageSize >= queueMaximumMessageSize;
            });
    }

    private perpareMessageRequest(message: IMessageToSend, delay?: number, attributes?: IMessageAttributes)
        : Promise<ISendMessageRequest> {
        if (attributes && attributes[GZIP_MARKER]) {
            return Promise.reject(new Error(`Using of internal attribute ${GZIP_MARKER} is not allowed`));
        }
        if (attributes && attributes[S3_MARKER]) {
            return Promise.reject(new Error(`Using of internal attribute ${S3_MARKER} is not allowed`));
        }
        const messageStr = isString(message) ? message : JSON.stringify(message);
        const params: ISendMessageRequest = {
            MessageBody: messageStr,
        };
        if (delay) {
            params.DelaySeconds = delay;
        }
        if (attributes) {
            attributes = Object.assign({}, attributes);
        }
        if (attributes) {
            if (attributes.FIFO_MessageGroupId) {
                params.MessageGroupId = attributes.FIFO_MessageGroupId;
                delete attributes.FIFO_MessageGroupId;
            }
            if (attributes.FIFO_MessageDeduplicationId) {
                params.MessageDeduplicationId = attributes.FIFO_MessageDeduplicationId;
                delete attributes.FIFO_MessageDeduplicationId;
            }
            params.MessageAttributes = createMessageAttributes(attributes);
        }
        let promise: Promise<string>;
        if (this._opts.gzip) {
            if (this._opts.minGzipSize && getMessageSize(params) < this._opts.minGzipSize) {
                promise = Promise.resolve(messageStr);
            } else {
                promise = compressMessage(messageStr);
                params.MessageAttributes = params.MessageAttributes || {};
                params.MessageAttributes[GZIP_MARKER] = {
                    StringValue: `1`,
                    DataType: 'Number',
                };
            }
        } else {
            promise = Promise.resolve(messageStr);
        }
        return promise
            .then((finalMessage) => {
                params.MessageBody = finalMessage;
                if (!this._opts.s3Fallback) {
                    return Promise.resolve(params);
                }
                return this.isLargeMessage(params, this._opts.minS3Size)
                    .then((isLarge) => {
                        if (!isLarge) {
                            return Promise.resolve(params);
                        }
                        return uploadBlob(this.getS3(), this._opts.s3Bucket!, finalMessage, this._opts.s3Prefix || '')
                            .then((uploadData) => {
                                params.MessageBody = JSON.stringify(uploadData);
                                params.MessageAttributes = params.MessageAttributes || {};
                                params.MessageAttributes[S3_MARKER] = {
                                    StringValue: `${uploadData.uploadSize}`,
                                    DataType: 'Number',
                                };
                                return Promise.resolve(params);
                            });
                    });
            });
    }
}
