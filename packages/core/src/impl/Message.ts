import {IMessageAttributes, parseMessageAttributes} from '../utils/attributeUtils';
import {EventEmitter} from 'events';
import {GZIP_MARKER, MessageGzip} from '../utils/gzipUtils';
import {deleteBlob, getBlob, IS3Upload, S3_MARKER} from '../utils/s3Utils';
import {SQSMessage} from '../types/SQSFacade';
import {BodyFormat, ISquiss} from '../types/ISquiss';
import {S3Facade} from '../types/S3Facade';
import {IMessage} from '../types/IMessage';

const EMPTY_BODY = '{}';

export interface IMessageOpts {
    msg: SQSMessage;
    unwrapSns?: boolean;
    bodyFormat?: BodyFormat;
    squiss: ISquiss;
    s3Retriever: () => S3Facade;
    s3Retain: boolean;
    messageGzip: MessageGzip;
}

interface SNSBody {
    Message?: string;
    Subject: string;
    TopicArn: string;
}

export class Message extends EventEmitter implements IMessage {

    private static formatMessage(msg: string | undefined, format: BodyFormat) {
        if (format === 'json') {
            return JSON.parse(msg || EMPTY_BODY);
        } else {
            return msg;
        }
    }

    public raw: SQSMessage;
    public body?: string | any;
    public subject?: string;
    public topicArn?: string;
    public topicName?: string;
    public attributes: IMessageAttributes;
    public sqsAttributes: { [k: string]: string };
    private _squiss: ISquiss;
    private _handled: boolean;
    private _opts: IMessageOpts;
    private _deleteCallback?: () => Promise<void>;
    private _s3Retriever: () => S3Facade;
    private _s3Retain: boolean;

    constructor(opts: IMessageOpts) {
        super();
        this._opts = opts;
        this.raw = opts.msg;
        this.body = opts.msg.Body;
        if (opts.unwrapSns) {
            const unwrapped: SNSBody = JSON.parse(this.body || EMPTY_BODY);
            this.body = unwrapped.Message;
            this.subject = unwrapped.Subject;
            this.topicArn = unwrapped.TopicArn;
            if (this.topicArn) {
                this.topicName = unwrapped.TopicArn.substr(unwrapped.TopicArn.lastIndexOf(':') + 1);
            }
        }
        this._squiss = opts.squiss;
        this._handled = false;
        this.attributes = parseMessageAttributes(opts.msg.MessageAttributes);
        this.sqsAttributes = opts.msg.Attributes || {};
        this._s3Retriever = opts.s3Retriever;
        this._s3Retain = opts.s3Retain;
    }

    public parse(): Promise<string | any> {
        if (this.body === undefined || this.body === null) {
            return Promise.resolve();
        }
        let promise = Promise.resolve(this.body);
        if (this.attributes[S3_MARKER]) {
            delete this.attributes[S3_MARKER];
            promise = this._getBlobMessage();
        }
        promise = promise
            .then((resolvedBody) => {
                if (this.attributes[GZIP_MARKER] === 1) {
                    delete this.attributes[GZIP_MARKER];
                    return this._opts.messageGzip.decompressMessage(resolvedBody);
                } else {
                    return Promise.resolve(resolvedBody);
                }
            });
        return promise
            .then((parsedBody) => {
                this.body = Message.formatMessage(parsedBody, this._opts.bodyFormat);
            });
    }

    public isHandled() {
        return this._handled;
    }

    public del(): Promise<void> {
        if (!this._handled) {
            this._handled = true;
            let promise: Promise<void>;
            if (this._deleteCallback) {
                promise = this._deleteCallback();
            } else {
                promise = Promise.resolve();
            }
            return promise
                .then(() => {
                    return this._squiss.deleteMessage(this);
                })
                .catch(() => {
                    this._handled = false;
                });
        } else {
            return Promise.resolve();
        }
    }

    public keep(): void {
        if (!this._handled) {
            this._squiss.handledMessage(this);
            this._handled = true;
        }
    }

    public release(): Promise<void> {
        if (!this._handled) {
            this._handled = true;
            return this._squiss.releaseMessage(this)
                .catch((e) => {
                    this._handled = false;
                });
        }
        return Promise.resolve();
    }

    public changeVisibility(timeoutInSeconds: number): Promise<void> {
        return this._squiss.changeMessageVisibility(this, timeoutInSeconds);
    }

    private _getBlobMessage() {
        const uploadData: IS3Upload = JSON.parse(this.body);
        const s3 = this._s3Retriever();
        return getBlob(s3, uploadData)
            .then((resolvedBody) => {
                this.emit('s3Download', uploadData);
                this._squiss.emit('s3Download', {data: uploadData, message: this});
                if (!this._s3Retain) {
                    this._deleteCallback = () => {
                        return deleteBlob(s3, uploadData)
                            .then(() => {
                                this.emit('s3Delete', uploadData);
                                this._squiss.emit('s3Delete', {data: uploadData, message: this});
                            });
                    };
                }
                return Promise.resolve(resolvedBody);
            });
    }

}
