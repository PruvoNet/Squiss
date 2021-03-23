import {isBoolean, isNumber, isString} from 'ts-type-guards';
import {
    Binary,
    MessageAttributeValue,
    MessageBodyAttributeMap, RequestBinary, RequestMessageAttributeValue,
    RequestMessageBodyAttributeMap
} from '../types/SQSFacade';

const EMPTY_OBJ: Record<string, any> = {};
const STRING_TYPE = 'String';
const NUMBER_TYPE = 'Number';
const BINARY_TYPE = 'Binary';

export type IBaseMessageAttribute = number | string | boolean | undefined;
export type IMessageAttribute = IBaseMessageAttribute | Binary;
export type IRequestMessageAttribute = IBaseMessageAttribute | RequestBinary;

export interface IBaseMessageAttributes {
    FIFO_MessageDeduplicationId?: string;
    FIFO_MessageGroupId?: string;
}

export interface IMessageAttributes extends IBaseMessageAttributes {
    [k: string]: IMessageAttribute;
}

export interface IRequestMessageAttributes extends IBaseMessageAttributes {
    [k: string]: IRequestMessageAttribute;
}

export const parseMessageAttributes = (messageAttributes: MessageBodyAttributeMap | undefined)
    : IMessageAttributes => {
    const _messageAttributes = messageAttributes || EMPTY_OBJ;
    return Object.keys(_messageAttributes).reduce((parsedAttributes: IMessageAttributes, name: string) => {
        parsedAttributes[name] = parseAttributeValue(_messageAttributes[name]);
        return parsedAttributes;
    }, {});
};

const parseAttributeValue = (unparsedAttribute: MessageAttributeValue): IMessageAttribute => {
    const type = unparsedAttribute.DataType;
    const stringValue = unparsedAttribute.StringValue;
    const binaryValue = unparsedAttribute.BinaryValue;

    switch (type) {
        case 'Number':
            return Number(stringValue);
        case 'Binary':
            return binaryValue;
        default:
            return stringValue || binaryValue;
    }
};

export const createMessageAttributes = (messageAttributes: IRequestMessageAttributes)
    : RequestMessageBodyAttributeMap | undefined => {
    const keys = Object.keys(messageAttributes);
    if (keys.length === 0) {
        return;
    }
    return Object.keys(messageAttributes).reduce((parsedAttributes: RequestMessageBodyAttributeMap, name: string) => {
        parsedAttributes[name] = createAttributeValue(messageAttributes[name]);
        return parsedAttributes;
    }, {});
};

const createAttributeValue = (unparsedAttribute: IRequestMessageAttribute): RequestMessageAttributeValue => {
    if (unparsedAttribute === undefined || unparsedAttribute === null) {
        unparsedAttribute = '';
    }
    if (isNumber(unparsedAttribute)) {
        return {
            DataType: NUMBER_TYPE,
            StringValue: String(unparsedAttribute),
        };
    } else if (isString(unparsedAttribute)) {
        return {
            DataType: STRING_TYPE,
            StringValue: unparsedAttribute,
        };
    } else if (isBoolean(unparsedAttribute)) {
        return {
            DataType: STRING_TYPE,
            StringValue: `${unparsedAttribute}`,
        };
    } else {
        return {
            DataType: BINARY_TYPE,
            BinaryValue: unparsedAttribute,
        };
    }
};
