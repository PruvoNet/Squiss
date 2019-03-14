'use strict';

import {SQS} from 'aws-sdk';
import {isNumber, isString} from 'ts-type-guards';

const EMPTY_OBJ = {};
const STRING_TYPE = 'String';
const NUMBER_TYPE = 'Number';
const BINARY_TYPE = 'Binary';

export type IMessageAttribute = number | string | SQS.Binary | undefined;

export interface IMessageAttributes {
  FIFO_MessageDeduplicationId?: string;
  FIFO_MessageGroupId?: string;
  [k: string]: IMessageAttribute;
}

export const parseMessageAttributes = (messageAttributes: SQS.MessageBodyAttributeMap | undefined)
  : IMessageAttributes => {
  const _messageAttributes = messageAttributes || EMPTY_OBJ as SQS.MessageBodyAttributeMap;
  return Object.keys(_messageAttributes).reduce((parsedAttributes: IMessageAttributes, name: string) => {
    parsedAttributes[name] = parseAttributeValue(_messageAttributes[name]);
    return parsedAttributes;
  }, {});
};

const parseAttributeValue = (unparsedAttribute: SQS.MessageAttributeValue): IMessageAttribute => {
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

export const createMessageAttributes = (messageAttributes: IMessageAttributes)
  : SQS.MessageBodyAttributeMap => {
  return Object.keys(messageAttributes).reduce((parsedAttributes: SQS.MessageBodyAttributeMap, name: string) => {
    parsedAttributes[name] = createAttributeValue(messageAttributes[name]);
    return parsedAttributes;
  }, {});
};

const createAttributeValue = (unparsedAttribute: IMessageAttribute): SQS.MessageAttributeValue => {
  if (!unparsedAttribute) {
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
  } else {
    return {
      DataType: BINARY_TYPE,
      BinaryValue: unparsedAttribute,
    };
  }
};
