import {EventEmitter} from 'events';
import {BatchResultErrorEntry, SQSMessage} from './SQSFacade';
import {IMessageAttributes} from '../utils/attributeUtils';
import {IS3Upload} from '../utils/s3Utils';
import {StrictEventEmitter} from './eventEmitter';
import {ReadonlyFlat} from './utils';

export type IMessageEmitter = StrictEventEmitter<EventEmitter, IMessageEvents>;

export interface IMessageEvents {
    delQueued: void;
    handled: void;
    released: void;
    timeoutReached: void;
    extendingTimeout: void;
    timeoutExtended: void;
    keep: void;
    delError: BatchResultErrorEntry;
    deleted: string;
    autoExtendFail: Error;
    autoExtendError: Error;
    s3Download: IS3Upload;
    s3Delete: IS3Upload;
}

export interface IMessage extends IMessageEmitter {
    readonly raw: ReadonlyFlat<SQSMessage>;
    readonly body?: string | any;
    readonly subject?: string;
    readonly topicArn?: string;
    readonly topicName?: string;
    readonly attributes: IMessageAttributes;
    readonly sqsAttributes: { [k: string]: string };

    parse(): Promise<string | any>;

    isHandled(): boolean;

    del(): Promise<void>;

    keep(): void;

    release(): Promise<void>;

    changeVisibility(timeoutInSeconds: number): Promise<void>;
}
