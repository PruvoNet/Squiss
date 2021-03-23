import {IS3Upload} from '../utils/s3Utils';
import {StrictEventEmitter} from './eventEmitter';
import {EventEmitter} from 'events';
import {IMessageAttributes} from '../utils/attributeUtils';
import {
    BatchResultErrorEntry,
    SendMessageBatchRequestEntry,
    SendMessageBatchResponse,
    SendMessageResponse, SQSFacade
} from './SQSFacade';
import {S3Facade} from './S3Facade';
import {MessageGzip} from '../utils/gzipUtils';
import {IMessage} from './IMessage';

export interface IMessageDeletedEventPayload {
    msg: IMessage;
    successId: string;
}

export interface IMessageErrorEventPayload {
    message: IMessage;
    error: Error;
}

export interface IMessageDeleteErrorEventPayload {
    message: IMessage;
    error: BatchResultErrorEntry;
}

export interface IMessageS3EventPayload {
    message: IMessage;
    data: IS3Upload;
}

export type ISendMessageRequest = Omit<SendMessageBatchRequestEntry, 'Id'>

export interface IObject {
    [k: string]: any;
}

export type IMessageToSend = IObject | string;

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

export interface ISquissInjectOptions {
    SQS: SQSFacade | (() => SQSFacade);
    S3: S3Facade | (() => S3Facade);
    messageGzip: MessageGzip;
}

export interface IDeleteQueueItem {
    msg: IMessage;
    Id: string;
    ReceiptHandle: string;
    resolve: () => void;
    reject: (reason?: any) => void;
}

export interface IDeleteQueueItemById {
    [k: string]: IDeleteQueueItem;
}

export interface ISquissEvents {
    delQueued: IMessage;
    handled: IMessage;
    released: IMessage;
    timeoutReached: IMessage;
    extendingTimeout: IMessage;
    timeoutExtended: IMessage;
    message: IMessage;
    keep: IMessage;
    drained: void;
    queueEmpty: void;
    maxInFlight: void;
    deleted: IMessageDeletedEventPayload;
    gotMessages: number;
    error: Error;
    aborted: Error;
    delError: IMessageDeleteErrorEventPayload;
    autoExtendFail: IMessageErrorEventPayload;
    autoExtendError: IMessageErrorEventPayload;
    s3Download: IMessageS3EventPayload;
    s3Delete: IMessageS3EventPayload;
    s3Upload: IS3Upload;
}

export type ISquissEmitter = StrictEventEmitter<EventEmitter, ISquissEvents>;

export interface ISquiss extends ISquissEmitter {
    readonly inFlight: number;
    readonly running: boolean;

    changeMessageVisibility(msg: IMessage | string, timeoutInSeconds: number): Promise<void>;

    createQueue(): Promise<string>;

    deleteMessage(msg: IMessage): Promise<void>;

    deleteQueue(): Promise<void>;

    getQueueUrl(): Promise<string>;

    getQueueVisibilityTimeout(): Promise<number>;

    getQueueMaximumMessageSize(): Promise<number>;

    handledMessage(msg: IMessage): void;

    releaseMessage(msg: IMessage): Promise<void>;

    purgeQueue(): Promise<void>;

    sendMessage(message: IMessageToSend, delay?: number, attributes?: IMessageAttributes)
        : Promise<SendMessageResponse>;

    sendMessages(messages: IMessageToSend[] | IMessageToSend, delay?: number,
                 attributes?: IMessageAttributes | IMessageAttributes[])
        : Promise<SendMessageBatchResponse>;

    start(): Promise<void>;

    stop(soft?: boolean, timeout?: number): Promise<boolean>;

    getS3(): S3Facade;
}
