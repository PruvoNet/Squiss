import * as LinkedList from 'linked-list';
import {IMessage} from '../types/IMessage';
import {ISquiss} from '../types/ISquiss';

const MAX_MESSAGE_AGE_MS = 43200000;

class Node extends LinkedList.Item {
    constructor(public message: IMessage, public receivedOn: number, public timerOn: number) {
        super();
    }
}

export interface ITimeoutExtenderOptions {
    visibilityTimeoutSecs?: number;
    noExtensionsAfterSecs?: number;
    advancedCallMs?: number;
}

interface MessageIndex {
    [k: string]: Node;
}

const optDefaults: ITimeoutExtenderOptions = {
    visibilityTimeoutSecs: 30,
    noExtensionsAfterSecs: MAX_MESSAGE_AGE_MS / 1000,
    advancedCallMs: 5000,
};

export class TimeoutExtender {

    public readonly _index: MessageIndex;
    public _linkedList: LinkedList<Node>;
    public _opts: ITimeoutExtenderOptions;
    private _squiss: ISquiss;
    private _timer: any;
    private readonly _visTimeout: number;
    private readonly _stopAfter: number;
    private readonly _apiLeadMs: number;

    constructor(squiss: ISquiss, opts?: ITimeoutExtenderOptions) {
        this._opts = Object.assign({}, optDefaults, opts || {});
        this._index = {};
        this._timer = undefined;
        this._squiss = squiss;
        this._linkedList = new LinkedList<Node>();
        this._squiss.on('handled', (msg: IMessage) => {
            return this.deleteMessage(msg);
        });
        this._squiss.on('message', (msg: IMessage) => {
            return this.addMessage(msg);
        });
        this._visTimeout = this._opts.visibilityTimeoutSecs! * 1000;
        this._stopAfter = Math.min(this._opts.noExtensionsAfterSecs! * 1000, MAX_MESSAGE_AGE_MS);
        this._apiLeadMs = Math.min(this._opts.advancedCallMs!, this._visTimeout);
    }

    public addMessage(message: IMessage) {
        const now = Date.now();
        this._addNode(new Node(message, now, now + this._visTimeout - this._apiLeadMs));
    }

    public deleteMessage(message: IMessage) {
        const node = this._index[message.raw.MessageId!];
        if (node) {
            this._deleteNode(node);
        }
    }

    public _addNode(node: Node) {
        this._index[node.message.raw.MessageId!] = node;
        this._linkedList.append(node);
        if (!node.prev) {
            this._headChanged();
        }
    }

    public _deleteNode(node: Node) {
        const msgId = node.message.raw.MessageId!;
        delete this._index[msgId];
        const isFirst = !node.prev;
        node.detach();
        if (isFirst) {
            this._headChanged();
        }
    }

    public _getNodeAge(node: Node) {
        return Date.now() - node.receivedOn + this._apiLeadMs;
    }

    public _headChanged() {
        if (this._timer) {
            clearTimeout(this._timer);
        }
        if (!this._linkedList.head) {
            return false;
        }
        const node = this._linkedList.head;
        this._timer = setTimeout(() => {
            if (this._getNodeAge(node) >= this._stopAfter) {
                this._deleteNode(node);
                node.message.keep();
                node.message.emit('keep');
                this._squiss.emit('keep', node.message);
                node.message.emit('timeoutReached');
                this._squiss.emit('timeoutReached', node.message);
                return;
            }
            return this._renewNode(node);
        }, node.timerOn - Date.now());
        return true;
    }

    public _renewNode(node: Node) {
        const extendByMs = Math.min(this._visTimeout, MAX_MESSAGE_AGE_MS - this._getNodeAge(node));
        const extendBySecs = Math.floor(extendByMs / 1000);
        node.message.emit('extendingTimeout');
        this._squiss.emit('extendingTimeout', node.message);
        this._squiss.changeMessageVisibility(node.message, extendBySecs)
            .then(() => {
                node.message.emit('timeoutExtended');
                this._squiss.emit('timeoutExtended', node.message);
            })
            .catch((err: Error) => {
                if (err.message.match(/Message does not exist or is not available/)) {
                    this._deleteNode(node);
                    node.message.emit('autoExtendFail', err);
                    this._squiss.emit('autoExtendFail', {message: node.message, error: err});
                } else {
                    node.message.emit('autoExtendError', err);
                    this._squiss.emit('autoExtendError', {message: node.message, error: err});
                }
            });
        this._deleteNode(node);
        node.timerOn = Date.now() + extendByMs - this._apiLeadMs;
        this._addNode(node);
    }
}
