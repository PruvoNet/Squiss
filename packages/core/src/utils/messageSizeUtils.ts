
import {MessageBodyAttributeMap} from '../types/SQSFacade';
import {ISendMessageRequest} from '../types/ISquiss';

export const getMessageSize = (message: ISendMessageRequest): number => {
    const msgAttributesSize = getMsgAttributesSize(message.MessageAttributes);
    const msgBodySize = getSizeInBytes(message.MessageBody);
    return msgAttributesSize + msgBodySize;
};

export const getSizeInBytes = (obj?: string | NodeJS.TypedArray | DataView | ArrayBuffer | SharedArrayBuffer)
    : number => {
    return obj ? Buffer.byteLength(obj) : 0;
};

const getMsgAttributesSize = (attributes?: MessageBodyAttributeMap): number => {
    let totalMsgAttributesSize = 0;
    attributes = attributes || {};
    for (const attribute in attributes) {
        if (attributes.hasOwnProperty(attribute)) {
            totalMsgAttributesSize += getSizeInBytes(attribute);
            const val = attributes[attribute];
            totalMsgAttributesSize += getSizeInBytes(val.DataType);
            totalMsgAttributesSize += getSizeInBytes(val.StringValue);
            // @ts-ignore
            totalMsgAttributesSize += getSizeInBytes(val.BinaryValue);
        }
    }
    return totalMsgAttributesSize;
};
