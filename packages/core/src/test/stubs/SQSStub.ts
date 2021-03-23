import {EventEmitter} from 'events';
import {
    CreateQueueRequest,
    DeleteMessageBatchRequest,
    DeleteMessageBatchResponse,
    GetQueueUrlRequest, ReceiveMessageRequest, SendMessageBatchRequest, SendMessageBatchResponse, SendMessageRequest,
    SQSFacade,
    SQSMessage
} from '../../types/SQSFacade';
import * as url from 'url';

export interface IBehaviourConfig {
    noIdInFailedToDeleteMessage?: boolean;
    noIdInDeletedMessage?: boolean;
    failToDeleteMessage?: boolean;
}

export class SQSStub extends EventEmitter implements SQSFacade {

    public msgs: SQSMessage[];
    public timeout: number;
    public msgCount: number;

    constructor(msgCount?: number, timeout?: number, public behaviourConfig?: IBehaviourConfig) {
        super();
        this.msgs = [];
        this.timeout = timeout === undefined ? 20 : timeout;
        this.msgCount = msgCount || 0;
        for (let i = 0; i < this.msgCount; i++) {
            this._addMessage(i);
        }
    }

    public async getEndpoint(): Promise<url.UrlObject> {
        return url.parse('https://foo.bar');
    }

    public async createQueue(params: CreateQueueRequest) {
        return this.getQueueUrl(params);
    }

    public async deleteMessageBatch(params: DeleteMessageBatchRequest) {
        const res: DeleteMessageBatchResponse = {
            Successful: [],
            Failed: [],
        };
        params.Entries.forEach((entry) => {
            if (this.behaviourConfig?.failToDeleteMessage) {
                res.Failed.push({
                    Id: this.behaviourConfig?.noIdInFailedToDeleteMessage ? undefined : entry.Id,
                    SenderFault: true,
                    Code: '500',
                    Message: 'Internal Error',
                });
            }
            if (parseInt(entry.ReceiptHandle, 10) < this.msgCount) {
                if (this.behaviourConfig?.noIdInDeletedMessage) {
                    res.Successful.push({});
                } else {
                    res.Successful.push({Id: entry.Id});
                }
            } else {
                res.Failed.push({
                    Id: entry.Id,
                    SenderFault: true,
                    Code: '404',
                    Message: 'Does not exist',
                });
            }
        });
        return res;
    }

    public async changeMessageVisibility() {
        return;
    }

    public async deleteQueue() {
        return;
    }

    public async getQueueUrl(params: GetQueueUrlRequest) {
        return {
            QueueUrl: `http://localhost:9324/queues/${params.QueueName}`,
        }
    }

    public async getQueueAttributes() {
        return {
            Attributes: {
                VisibilityTimeout: '31',
                MaximumMessageSize: '200',
                ReceiveMessageWaitTimeSeconds: '',
                DelaySeconds: '',
                MessageRetentionPeriod: '',
                Policy: '',
            },
        }
    }

    public receiveMessage(params?: ReceiveMessageRequest) {
        return this._makeReq(() => {
            const msgs = this.msgs.splice(0, params ? params.MaxNumberOfMessages : undefined);
            return new Promise((resolve, reject) => {
                if (msgs.length) {
                    return resolve({Messages: msgs});
                }
                let removeListeners = () => {
                    // Intentional empty
                };
                const timeout = setTimeout(() => {
                    removeListeners();
                    resolve({});
                }, this.timeout);
                const onAbort = () => {
                    removeListeners();
                    const err: any = new Error('Request aborted by user');
                    err.code = err.name = 'RequestAbortedError';
                    err.retryable = false;
                    err.time = new Date();
                    reject(err);
                };
                const onNewMessage = () => {
                    removeListeners();
                    resolve(this.receiveMessage().promise());
                };
                removeListeners = () => {
                    clearTimeout(timeout);
                    this.removeListener('newMessage', onNewMessage);
                    this.removeListener('abort', onAbort);
                };
                this.once('abort', onAbort);
                this.once('newMessage', onNewMessage);
                return undefined;
            });
        });
    }

    public async purgeQueue() {
        this.msgs = [];
        this.msgCount = 0;
    }

    public async sendMessage(params: SendMessageRequest) {
        this._addMessage(params.QueueUrl, params.MessageBody);
        return {
            MessageId: 'd2206b43-df52-5161-a8e8-24dc83737962',
            MD5OfMessageAttributes: 'deadbeefdeadbeefdeadbeefdeadbeef',
            MD5OfMessageBody: 'deadbeefdeadbeefdeadbeefdeadbeef',
        }
    }

    public async sendMessageBatch(params: SendMessageBatchRequest) {
        const res: SendMessageBatchResponse = {
            Successful: [],
            Failed: [],
        };
        params.Entries.forEach((entry, idx) => {
            if (entry.MessageBody !== 'FAIL') {
                this._addMessage(entry.Id, entry.MessageBody);
                res.Successful.push({
                    Id: entry.Id,
                    MessageId: idx.toString(),
                    MD5OfMessageAttributes: 'deadbeefdeadbeefdeadbeefdeadbeef',
                    MD5OfMessageBody: 'deadbeefdeadbeefdeadbeefdeadbeef',
                });
            } else {
                res.Failed.push({
                    Id: entry.Id,
                    SenderFault: true,
                    Code: 'Message is empty',
                    Message: '',
                });
            }
        });
        return res;
    }

    private _addMessage(id: number | string, body?: string) {
        this.msgs.push({
            MessageId: `id_${id}`,
            ReceiptHandle: `${id}`,
            Body: body || `{"num": ${id}}`,
        });
        this.emit('newMessage');
    }

    private _makeReq(func: any) {
        return {
            promise: func,
            abort: () => {
                this.emit('abort');
            },
        };
    }
}
