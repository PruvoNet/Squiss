import * as url from 'url';
import {EventEmitter} from 'events';
import {Message} from './Message';
import {ITimeoutExtenderOptions, TimeoutExtender} from './TimeoutExtender';
import {createMessageAttributes, IRequestMessageAttributes} from '../utils/attributeUtils';
import {isString} from 'ts-type-guards';
import {GZIP_MARKER} from '../utils/gzipUtils';
import {S3_MARKER, uploadBlob} from '../utils/s3Utils';
import {getMessageSize} from '../utils/messageSizeUtils';
import {S3Facade} from '../types/S3Facade';
import {
    Abortable,
    CreateQueueRequest,
    GetQueueUrlRequest, ReceiveMessageRequest,
    ReceiveMessageResponse,
    SendMessageBatchRequest,
    SendMessageBatchRequestEntry,
    SendMessageBatchResponse,
    SendMessageRequest,
    SendMessageResponse,
    SQSFacade,
    SQSMessage, DeleteMessageBatchResponse,
} from '../types/SQSFacade';
import {buildLazyGetter, removeEmptyKeys} from '../utils/utils';
import {IMessage} from '../types/IMessage';
import {
    IDeleteQueueItem,
    IDeleteQueueItemById,
    IMessageToSend,
    ISendMessageRequest,
    ISquiss, ISquissInjectOptions,
    ISquissOptions
} from '../types/ISquiss';

const AWS_MAX_SEND_BATCH = 10;

const getFromProvider = <A>(arg: A | (() => A)): A => {
    if (typeof arg === 'function') {
        return (arg as (() => A))();
    } else {
        return arg;
    }
}

const optDefaults: Partial<ISquissOptions> = {
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

export class Squiss extends EventEmitter implements ISquiss {

    public get inFlight(): number {
        return this._inFlight;
    }

    public get running(): boolean {
        return this._running;
    }

    public getS3: () => S3Facade;

    public _timeoutExtender: TimeoutExtender | undefined;
    private sqs: SQSFacade;
    private _opts: ISquissOptions & ISquissInjectOptions;
    private _running = false;
    private _paused = true;
    private _inFlight = 0;
    private _queueVisibilityTimeout = 0;
    private _queueMaximumMessageSize = 0;
    private _queueUrl: string;
    private _delQueue = new Map<string, IDeleteQueueItem>();
    private _delTimer: any;
    private _activeReq: Abortable<ReceiveMessageResponse> | undefined;

    constructor(opts: ISquissOptions & ISquissInjectOptions) {
        super();
        this._opts = Object.assign({}, optDefaults, opts);
        this._initOpts();
        this._queueUrl = this._opts.queueUrl || '';
        this.sqs = getFromProvider(this._opts.SQS);
        this.getS3 = buildLazyGetter<S3Facade>(() => getFromProvider(this._opts.S3));
    }

    public changeMessageVisibility(msg: IMessage | string, timeoutInSeconds: number): Promise<void> {
        let receiptHandle: string;
        if (isString(msg)) {
            receiptHandle = msg;
        } else {
            receiptHandle = msg.raw.ReceiptHandle!;
        }
        return this.getQueueUrl()
            .then((queueUrl) => {
                return this.sqs.changeMessageVisibility({
                    QueueUrl: queueUrl,
                    ReceiptHandle: receiptHandle,
                    VisibilityTimeout: timeoutInSeconds,
                });
            });
    }

    public createQueue(): Promise<string> {
        if (!this._opts.queueName) {
            return Promise.reject(new Error('Squiss was not instantiated with a queueName'));
        }
        const params: CreateQueueRequest = {
            QueueName: this._opts.queueName,
            Attributes: {
                ReceiveMessageWaitTimeSeconds: this._opts.receiveWaitTimeSecs!.toString(),
                DelaySeconds: this._opts.delaySecs!.toString(),
                MaximumMessageSize: this._opts.maxMessageBytes!.toString(),
                MessageRetentionPeriod: this._opts.messageRetentionSecs!.toString(),
            },
        };
        if (this._opts.visibilityTimeoutSecs) {
            params.Attributes.VisibilityTimeout = this._opts.visibilityTimeoutSecs.toString();
        }
        if (this._opts.queuePolicy) {
            params.Attributes.Policy = this._opts.queuePolicy;
        }
        return this.sqs.createQueue(params).then(({QueueUrl}) => {
            this._queueUrl = QueueUrl;
            return QueueUrl;
        });
    }

    public deleteMessage(msg: IMessage): Promise<void> {
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
            this._deleteXMessages(this._opts.deleteBatchSize);
        } else if (!this._delTimer) {
            this._delTimer = setTimeout(() => {
                this._delTimer = undefined;
                this._deleteXMessages();
            }, this._opts.deleteWaitMs);
        }
        return promise;
    }

    public deleteQueue(): Promise<void> {
        return this.getQueueUrl()
            .then((queueUrl) => {
                return this.sqs.deleteQueue({QueueUrl: queueUrl});
            });
    }

    public async getQueueUrl(): Promise<string> {
        if (this._queueUrl) {
            return this._queueUrl;
        }
        const params: GetQueueUrlRequest = {QueueName: this._opts.queueName!};
        if (this._opts.accountNumber) {
            params.QueueOwnerAWSAccountId = this._opts.accountNumber.toString();
        }
        const {QueueUrl} = await this.sqs.getQueueUrl(params);
        this._queueUrl = QueueUrl;
        if (this._opts.correctQueueUrl) {
            const newUrl = await this.sqs.getEndpoint();
            const parsedQueueUrl = url.parse(this._queueUrl);
            newUrl.pathname = parsedQueueUrl.pathname;
            this._queueUrl = url.format(newUrl);
        }
        return this._queueUrl;
    }

    public getQueueVisibilityTimeout(): Promise<number> {
        if (this._queueVisibilityTimeout) {
            return Promise.resolve(this._queueVisibilityTimeout);
        }
        return this.getQueueUrl().then((queueUrl) => {
            return this.sqs.getQueueAttributes({
                AttributeNames: ['VisibilityTimeout'],
                QueueUrl: queueUrl,
            });
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
            });
        }).then((res) => {
            if (!res.Attributes || !res.Attributes.MaximumMessageSize) {
                throw new Error('SQS.GetQueueAttributes call did not return expected shape. Response: ' +
                    JSON.stringify(res));
            }
            this._queueMaximumMessageSize = parseInt(res.Attributes.MaximumMessageSize, 10);
            return this._queueMaximumMessageSize;
        });
    }

    public handledMessage(msg: IMessage): void {
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

    public releaseMessage(msg: IMessage): Promise<void> {
        this.handledMessage(msg);
        return this.changeMessageVisibility(msg, 0)
            .then((res) => {
                msg.emit('released');
                this.emit('released', msg);
                return res;
            });
    }

    public purgeQueue(): Promise<void> {
        return this.getQueueUrl()
            .then((queueUrl) => {
                return this.sqs.purgeQueue({QueueUrl: queueUrl});
            })
            .then(() => {
                this._inFlight = 0;
                this._delQueue = new Map();
                this._delTimer = undefined;
                return Promise.resolve();
            });
    }

    public async sendMessage(message: IMessageToSend, delay?: number, attributes?: IRequestMessageAttributes)
        : Promise<SendMessageResponse> {
        const [rawParams, queueUrl] = await Promise.all([
            this._prepareMessageRequest(message, delay, attributes),
            this.getQueueUrl(),
        ]);
        const params: SendMessageRequest = {
            QueueUrl: queueUrl,
            ...rawParams,
        };
        return this.sqs.sendMessage(params);
    }

    public sendMessages(messages: IMessageToSend[] | IMessageToSend, delay?: number,
                        attributes?: IRequestMessageAttributes | IRequestMessageAttributes[])
        : Promise<SendMessageBatchResponse> {
        return this.getQueueMaximumMessageSize()
            .then((queueMaximumMessageSize) => {
                return this._prepareMessagesToSend(messages, queueMaximumMessageSize, delay, attributes);
            })
            .then((batches) => {
                return Promise.all(batches.map((batch, idx) => {
                    return this._sendMessageBatch(batch, idx * AWS_MAX_SEND_BATCH);
                }));
            })
            .then((results) => {
                const merged: SendMessageBatchResponse = {Successful: [], Failed: []};
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
        this._running = this._paused = false;
        if (!this._inFlight) {
            return Promise.resolve(true);
        }
        let resolved = false;
        let timer: any;
        return new Promise((resolve) => {
            this.on('drained', () => {
                if (!resolved) {
                    resolved = true;
                    if (timer) {
                        clearTimeout(timer);
                        timer = undefined;
                    }
                    resolve(true);
                }
            });
            timer = timeout ? setTimeout(() => {
                resolved = true;
                resolve(false);
            }, timeout) : undefined;
        });
    }

    private _initOpts() {
        if (!this._opts.queueUrl && !this._opts.queueName) {
            throw new Error('Squiss requires either the "queueUrl", or the "queueName".');
        }
        if (this._opts.s3Fallback && !this._opts.s3Bucket) {
            throw new Error('Squiss requires "s3Bucket" to be defined is using s3 fallback');
        }
        this._opts.deleteBatchSize = Math.min(this._opts.deleteBatchSize!, 10);
        this._opts.receiveBatchSize = Math.min(this._opts.receiveBatchSize!,
            this._opts.maxInFlight! > 0 ? this._opts.maxInFlight! : 10, 10);
        this._opts.minReceiveBatchSize = Math.min(this._opts.minReceiveBatchSize!, this._opts.receiveBatchSize);
    }

    private async _deleteMessages(batch: IDeleteQueueItem[]): Promise<void> {
        try {
            const queueUrl = await this.getQueueUrl();
            const result = await this.sqs.deleteMessageBatch({
                QueueUrl: queueUrl,
                Entries: batch.map((item) => {
                    return {
                        Id: item.Id,
                        ReceiptHandle: item.ReceiptHandle,
                    };
                }),
            });
            this._handleBatchDeleteResults(batch, result);
        } catch (err) {
            this.emit('error', err);

        }
    }

    private _emitMessages(messages: SQSMessage[]): void {
        messages.forEach((msg) => {
            const message = new Message({
                squiss: this,
                unwrapSns: this._opts.unwrapSns,
                bodyFormat: this._opts.bodyFormat,
                msg,
                s3Retriever: this.getS3.bind(this),
                s3Retain: this._opts.s3Retain || false,
                messageGzip: this._opts.messageGzip,
            });
            this._inFlight++;
            message.parse()
                .then(() => {
                    this.emit('message', message);
                })
                .catch((e: Error) => {
                    this.emit('error', e);
                    message.release();
                });
        });
    }

    private _getBatch(queueUrl: string): void {
        if (this._activeReq || !this._running) {
            return;
        }
        const maxMessagesToGet = this._getMaxMessagesToGet();
        if (maxMessagesToGet < this._opts.minReceiveBatchSize!) {
            this._paused = true;
            return;
        }
        const params: ReceiveMessageRequest = removeEmptyKeys({
            QueueUrl: queueUrl, MaxNumberOfMessages: maxMessagesToGet,
            WaitTimeSeconds: this._opts.receiveWaitTimeSecs,
            MessageAttributeNames: this._opts.receiveAttributes,
            AttributeNames: this._opts.receiveSqsAttributes,
            VisibilityTimeout: this._opts.visibilityTimeoutSecs,
        });
        this._activeReq = this.sqs.receiveMessage(params);
        this._activeReq.promise().then(this._handleGetBatchResult(queueUrl)).catch((err) => {
            this._activeReq = undefined;
            if (err.message === 'Request aborted' || (err.code && err.code === 'RequestAbortedError')) {
                this.emit('aborted', err);
            } else {
                setTimeout(this._getBatch.bind(this, queueUrl), this._opts.pollRetryMs);
                this.emit('error', err);
            }
        });
    }

    private _initTimeoutExtender(): Promise<void> {
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

    private async _sendMessageBatch(messages: ISendMessageRequest[], startIndex: number):
        Promise<SendMessageBatchResponse> {
        const start = startIndex || 0;
        const queueUrl = await this.getQueueUrl();
        const params: SendMessageBatchRequest = {
            QueueUrl: queueUrl,
            Entries: [],
        };
        messages.forEach((msg, idx) => {
            const entry: SendMessageBatchRequestEntry = {
                Id: (start + idx).toString(),
                ...msg,
            };
            params.Entries.push(entry);
        });
        return this.sqs.sendMessageBatch(params);
    }

    private _slotsAvailable(): boolean {
        return !this._opts.maxInFlight || this._inFlight < this._opts.maxInFlight;
    }

    private _startPoller(): Promise<void> {
        return this._initTimeoutExtender()
            .then(() => this.getQueueUrl())
            .then((queueUrl) => this._getBatch(queueUrl))
            .catch((e: Error) => {
                this.emit('error', e);
            });
    }

    private _deleteXMessages(x?: number) {
        const delQueue = this._delQueue;
        const iterator = delQueue.entries();
        const delBatch = Array.from({length: x || delQueue.size}, function (this: typeof iterator) {
            const element = this.next().value;
            delQueue.delete(element[0]);
            return element[1];
        }, iterator);
        this._deleteMessages(delBatch);
    }

    private _isLargeMessage(message: ISendMessageRequest, minSize?: number): Promise<boolean> {
        const messageSize = getMessageSize(message);
        if (minSize) {
            return Promise.resolve(messageSize > minSize);
        }
        return this.getQueueMaximumMessageSize()
            .then((queueMaximumMessageSize) => {
                return messageSize >= queueMaximumMessageSize;
            });
    }

    private _prepareMessageParams(message: IMessageToSend, delay?: number, attributes?: IRequestMessageAttributes) {
        const messageStr = isString(message) ? message : JSON.stringify(message);
        const params: ISendMessageRequest = {MessageBody: messageStr, DelaySeconds: delay};
        attributes = Object.assign({}, attributes);
        params.MessageGroupId = attributes.FIFO_MessageGroupId;
        delete attributes.FIFO_MessageGroupId;
        params.MessageDeduplicationId = attributes.FIFO_MessageDeduplicationId;
        delete attributes.FIFO_MessageDeduplicationId;
        params.MessageAttributes = createMessageAttributes(attributes);
        let getMessagePromise = Promise.resolve(messageStr);
        if (this._opts.gzip && (!this._opts.minGzipSize || getMessageSize(params) >= this._opts.minGzipSize)) {
            getMessagePromise = this._opts.messageGzip.compressMessage(messageStr);
            params.MessageAttributes = params.MessageAttributes || {};
            params.MessageAttributes[GZIP_MARKER] = {
                StringValue: `1`,
                DataType: 'Number',
            };
        }
        return getMessagePromise.then((finalMessage) => {
            params.MessageBody = finalMessage;
            return {finalMessage, params};
        });
    }

    private _handleLargeMessagePrepare({finalMessage, params}: { finalMessage: string, params: ISendMessageRequest }) {
        if (!this._opts.s3Fallback) {
            return Promise.resolve(params);
        }
        return this._isLargeMessage(params, this._opts.minS3Size)
            .then((isLarge) => {
                if (!isLarge) {
                    return Promise.resolve(params);
                }
                return uploadBlob(this.getS3(), this._opts.s3Bucket!, finalMessage, this._opts.s3Prefix || '')
                    .then((uploadData) => {
                        this.emit('s3Upload', uploadData);
                        params.MessageBody = JSON.stringify(uploadData);
                        params.MessageAttributes = params.MessageAttributes || {};
                        params.MessageAttributes[S3_MARKER] = {
                            StringValue: `${uploadData.uploadSize}`,
                            DataType: 'Number',
                        };
                        return Promise.resolve(params);
                    });
            });
    }

    private async _prepareMessageRequest(message: IMessageToSend, delay?: number,
                                         attributes?: IRequestMessageAttributes)
        : Promise<ISendMessageRequest> {
        if (attributes && attributes[GZIP_MARKER]) {
            throw new Error(`Using of internal attribute ${GZIP_MARKER} is not allowed`);
        }
        if (attributes && attributes[S3_MARKER]) {
            throw new Error(`Using of internal attribute ${S3_MARKER} is not allowed`);
        }
        const paramsRaw = await this._prepareMessageParams(message, delay, attributes);
        const params = await this._handleLargeMessagePrepare(paramsRaw);
        return removeEmptyKeys(params);
    }

    private _handleBatchDeleteResults(batch: IDeleteQueueItem[], data: DeleteMessageBatchResponse) {
        const acc: IDeleteQueueItemById = {};
        const itemById: IDeleteQueueItemById = batch.reduce((prevByValue, item) => {
            prevByValue[item.Id] = item;
            return prevByValue;
        }, acc);
        if (data.Failed && data.Failed.length) {
            data.Failed.forEach((fail) => {
                const id = fail.Id;
                if (!id) {
                    throw new Error('No id returned in failed message response');
                }
                this.emit('delError', {error: fail, message: itemById[id].msg});
                itemById[id].msg.emit('delError', fail);
                itemById[id].reject(fail);
            });
        }
        if (data.Successful && data.Successful.length) {
            data.Successful.forEach((success) => {
                const id = success.Id;
                if (!id) {
                    throw new Error('No id returned in success message response');
                }
                const msg = itemById[id].msg;
                this.emit('deleted', {msg, successId: id});
                msg.emit('deleted', id);
                itemById[id].resolve();
            });
        }
    }

    private _prepareMessagesToSend(messages: IMessageToSend[] | IMessageToSend, queueMaximumMessageSize: number,
                                   delay?: number,
                                   attributes?: IRequestMessageAttributes | IRequestMessageAttributes[]) {
        const msgs: IMessageToSend[] = Array.isArray(messages) ? messages : [messages];
        const defaultAttributes = (attributes && !Array.isArray(attributes)) ? attributes : undefined;
        const arrayAttributes = (attributes && Array.isArray(attributes)) ? attributes : [];
        const promises = msgs.map((msg, i) => {
            return this._prepareMessageRequest(msg, delay, defaultAttributes || arrayAttributes[i]);
        });
        return Promise.all(promises)
            .then((requests) => {
                const batches: ISendMessageRequest[][] = [];
                let currentBatchSize = 0;
                let currentBatchLength = 0;
                requests.forEach((message) => {
                    const messageSize = getMessageSize(message);
                    if (currentBatchLength % AWS_MAX_SEND_BATCH === 0 ||
                        currentBatchSize + messageSize >= queueMaximumMessageSize) {
                        currentBatchLength = currentBatchSize = 0;
                        batches.push([]);
                    }
                    currentBatchSize += messageSize;
                    currentBatchLength++;
                    batches[batches.length - 1].push(message);
                });
                return batches;
            });
    }

    private _handleGetBatchResult(queueUrl: string) {
        return (data: ReceiveMessageResponse) => {
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
                const next = this._getBatch.bind(this, queueUrl);
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
        };
    }

    private _getMaxMessagesToGet() {
        return !this._opts.maxInFlight ? this._opts.receiveBatchSize! :
            Math.min(this._opts.maxInFlight - this._inFlight, this._opts.receiveBatchSize!);
    }
}
