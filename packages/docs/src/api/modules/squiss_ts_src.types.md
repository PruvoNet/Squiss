[Squiss-TS](../README.md) / [squiss-ts/src](squiss_ts_src.md) / Types

# Namespace: Types

[squiss-ts/src](squiss_ts_src.md).Types

## Table of contents

### Interfaces

- [Abortable](../interfaces/squiss_ts_src.types.abortable.md)
- [BatchResultErrorEntry](../interfaces/squiss_ts_src.types.batchresulterrorentry.md)
- [ChangeMessageVisibilityRequest](../interfaces/squiss_ts_src.types.changemessagevisibilityrequest.md)
- [CreateQueueRequest](../interfaces/squiss_ts_src.types.createqueuerequest.md)
- [CreateQueueResponse](../interfaces/squiss_ts_src.types.createqueueresponse.md)
- [DeleteMessageBatchRequest](../interfaces/squiss_ts_src.types.deletemessagebatchrequest.md)
- [DeleteMessageBatchRequestEntry](../interfaces/squiss_ts_src.types.deletemessagebatchrequestentry.md)
- [DeleteMessageBatchResponse](../interfaces/squiss_ts_src.types.deletemessagebatchresponse.md)
- [DeleteMessageBatchResultEntry](../interfaces/squiss_ts_src.types.deletemessagebatchresultentry.md)
- [DeleteObjectRequest](../interfaces/squiss_ts_src.types.deleteobjectrequest.md)
- [DeleteQueueRequest](../interfaces/squiss_ts_src.types.deletequeuerequest.md)
- [GetObjectRequest](../interfaces/squiss_ts_src.types.getobjectrequest.md)
- [GetObjectResponse](../interfaces/squiss_ts_src.types.getobjectresponse.md)
- [GetQueueAttributesRequest](../interfaces/squiss_ts_src.types.getqueueattributesrequest.md)
- [GetQueueAttributesResponse](../interfaces/squiss_ts_src.types.getqueueattributesresponse.md)
- [GetQueueUrlRequest](../interfaces/squiss_ts_src.types.getqueueurlrequest.md)
- [GetQueueUrlResponse](../interfaces/squiss_ts_src.types.getqueueurlresponse.md)
- [IDeleteQueueItem](../interfaces/squiss_ts_src.types.ideletequeueitem.md)
- [IDeleteQueueItemById](../interfaces/squiss_ts_src.types.ideletequeueitembyid.md)
- [IMessage](../interfaces/squiss_ts_src.types.imessage.md)
- [IMessageDeleteErrorEventPayload](../interfaces/squiss_ts_src.types.imessagedeleteerroreventpayload.md)
- [IMessageDeletedEventPayload](../interfaces/squiss_ts_src.types.imessagedeletedeventpayload.md)
- [IMessageErrorEventPayload](../interfaces/squiss_ts_src.types.imessageerroreventpayload.md)
- [IMessageEvents](../interfaces/squiss_ts_src.types.imessageevents.md)
- [IMessageS3EventPayload](../interfaces/squiss_ts_src.types.imessages3eventpayload.md)
- [IObject](../interfaces/squiss_ts_src.types.iobject.md)
- [IQueueAttributes](../interfaces/squiss_ts_src.types.iqueueattributes.md)
- [ISquiss](../interfaces/squiss_ts_src.types.isquiss.md)
- [ISquissEvents](../interfaces/squiss_ts_src.types.isquissevents.md)
- [ISquissInjectOptions](../interfaces/squiss_ts_src.types.isquissinjectoptions.md)
- [ISquissOptions](../interfaces/squiss_ts_src.types.isquissoptions.md)
- [MessageAttributeValue](../interfaces/squiss_ts_src.types.messageattributevalue.md)
- [MessageSystemAttributeValue](../interfaces/squiss_ts_src.types.messagesystemattributevalue.md)
- [PurgeQueueRequest](../interfaces/squiss_ts_src.types.purgequeuerequest.md)
- [PutObjectRequest](../interfaces/squiss_ts_src.types.putobjectrequest.md)
- [ReceiveMessageRequest](../interfaces/squiss_ts_src.types.receivemessagerequest.md)
- [ReceiveMessageResponse](../interfaces/squiss_ts_src.types.receivemessageresponse.md)
- [RequestMessageAttributeValue](../interfaces/squiss_ts_src.types.requestmessageattributevalue.md)
- [S3Facade](../interfaces/squiss_ts_src.types.s3facade.md)
- [SQSFacade](../interfaces/squiss_ts_src.types.sqsfacade.md)
- [SQSMessage](../interfaces/squiss_ts_src.types.sqsmessage.md)
- [SendMessageBatchRequest](../interfaces/squiss_ts_src.types.sendmessagebatchrequest.md)
- [SendMessageBatchRequestEntry](../interfaces/squiss_ts_src.types.sendmessagebatchrequestentry.md)
- [SendMessageBatchResponse](../interfaces/squiss_ts_src.types.sendmessagebatchresponse.md)
- [SendMessageBatchResultEntry](../interfaces/squiss_ts_src.types.sendmessagebatchresultentry.md)
- [SendMessageRequest](../interfaces/squiss_ts_src.types.sendmessagerequest.md)
- [SendMessageResponse](../interfaces/squiss_ts_src.types.sendmessageresponse.md)

### Type aliases

- [Binary](squiss_ts_src.types.md#binary)
- [BodyFormat](squiss_ts_src.types.md#bodyformat)
- [IAwsConfig](squiss_ts_src.types.md#iawsconfig)
- [IMessageEmitter](squiss_ts_src.types.md#imessageemitter)
- [IMessageToSend](squiss_ts_src.types.md#imessagetosend)
- [ISendMessageRequest](squiss_ts_src.types.md#isendmessagerequest)
- [ISquissEmitter](squiss_ts_src.types.md#isquissemitter)
- [MessageBodyAttributeMap](squiss_ts_src.types.md#messagebodyattributemap)
- [MessageBodySystemAttributeMap](squiss_ts_src.types.md#messagebodysystemattributemap)
- [QueueAttributeName](squiss_ts_src.types.md#queueattributename)
- [RequestBinary](squiss_ts_src.types.md#requestbinary)
- [RequestMessageBodyAttributeMap](squiss_ts_src.types.md#requestmessagebodyattributemap)

## Type aliases

### Binary

Ƭ **Binary**: Buffer \| Uint8Array \| {} \| *string*

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:71

___

### BodyFormat

Ƭ **BodyFormat**: *json* \| *plain* \| *undefined*

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:31

___

### IAwsConfig

Ƭ **IAwsConfig**<SQSClientConfig, ISQSClient, S3ClientConfig, IS3Client, SQSClient, S3Client\>: *object*

#### Type parameters:

Name | Type | Default |
:------ | :------ | :------ |
`SQSClientConfig` | - | - |
`ISQSClient` | - | - |
`S3ClientConfig` | - | - |
`IS3Client` | - | - |
`SQSClient` | *Constructor*<ISQSClient, SQSClientConfig\> | *Constructor*<ISQSClient, SQSClientConfig\> |
`S3Client` | *Constructor*<IS3Client, S3ClientConfig\> | *Constructor*<IS3Client, S3ClientConfig\> |

#### Type declaration:

Name | Type |
:------ | :------ |
`s3`? | { `client?`: IS3Client \| S3Client ; `configuration?`: S3ClientConfig  } \| { `facade`: [*S3Facade*](../interfaces/squiss_ts_src.types.s3facade.md)  } |
`sqs`? | { `client?`: ISQSClient \| SQSClient ; `configuration?`: SQSClientConfig  } \| { `facade`: [*SQSFacade*](../interfaces/squiss_ts_src.types.sqsfacade.md)  } |

Defined in: node_modules/@squiss/core/lib/types/awsConfig.d.ts:4

___

### IMessageEmitter

Ƭ **IMessageEmitter**: *StrictEventEmitter*<EventEmitter, [*IMessageEvents*](../interfaces/squiss_ts_src.types.imessageevents.md)\>

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:8

___

### IMessageToSend

Ƭ **IMessageToSend**: [*IObject*](../interfaces/squiss_ts_src.types.iobject.md) \| *string*

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:30

___

### ISendMessageRequest

Ƭ **ISendMessageRequest**: *Omit*<[*SendMessageBatchRequestEntry*](../interfaces/squiss_ts_src.types.sendmessagebatchrequestentry.md), *Id*\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:26

___

### ISquissEmitter

Ƭ **ISquissEmitter**: *StrictEventEmitter*<EventEmitter, [*ISquissEvents*](../interfaces/squiss_ts_src.types.isquissevents.md)\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:104

___

### MessageBodyAttributeMap

Ƭ **MessageBodyAttributeMap**: *Record*<string, [*MessageAttributeValue*](../interfaces/squiss_ts_src.types.messageattributevalue.md)\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:94

___

### MessageBodySystemAttributeMap

Ƭ **MessageBodySystemAttributeMap**: *Record*<string, [*MessageSystemAttributeValue*](../interfaces/squiss_ts_src.types.messagesystemattributevalue.md)\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:96

___

### QueueAttributeName

Ƭ **QueueAttributeName**: *All* \| *Policy* \| *VisibilityTimeout* \| *MaximumMessageSize* \| *MessageRetentionPeriod* \| *ApproximateNumberOfMessages* \| *ApproximateNumberOfMessagesNotVisible* \| *CreatedTimestamp* \| *LastModifiedTimestamp* \| *QueueArn* \| *ApproximateNumberOfMessagesDelayed* \| *DelaySeconds* \| *ReceiveMessageWaitTimeSeconds* \| *RedrivePolicy* \| *FifoQueue* \| *ContentBasedDeduplication* \| *KmsMasterKeyId* \| *KmsDataKeyReusePeriodSeconds* \| *DeduplicationScope* \| *FifoThroughputLimit* \| *string*

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:3

___

### RequestBinary

Ƭ **RequestBinary**: Uint8Array

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:72

___

### RequestMessageBodyAttributeMap

Ƭ **RequestMessageBodyAttributeMap**: *Record*<string, [*RequestMessageAttributeValue*](../interfaces/squiss_ts_src.types.requestmessageattributevalue.md)\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:95
