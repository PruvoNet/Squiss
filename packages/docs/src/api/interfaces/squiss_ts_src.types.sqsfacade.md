[Squiss-TS](../README.md) / [squiss-ts/src](../modules/squiss_ts_src.md) / [Types](../modules/squiss_ts_src.types.md) / SQSFacade

# Interface: SQSFacade

[squiss-ts/src](../modules/squiss_ts_src.md).[Types](../modules/squiss_ts_src.types.md).SQSFacade

## Table of contents

### Properties

- [changeMessageVisibility](squiss_ts_src.types.sqsfacade.md#changemessagevisibility)
- [createQueue](squiss_ts_src.types.sqsfacade.md#createqueue)
- [deleteMessageBatch](squiss_ts_src.types.sqsfacade.md#deletemessagebatch)
- [deleteQueue](squiss_ts_src.types.sqsfacade.md#deletequeue)
- [getEndpoint](squiss_ts_src.types.sqsfacade.md#getendpoint)
- [getQueueAttributes](squiss_ts_src.types.sqsfacade.md#getqueueattributes)
- [getQueueUrl](squiss_ts_src.types.sqsfacade.md#getqueueurl)
- [purgeQueue](squiss_ts_src.types.sqsfacade.md#purgequeue)
- [receiveMessage](squiss_ts_src.types.sqsfacade.md#receivemessage)
- [sendMessage](squiss_ts_src.types.sqsfacade.md#sendmessage)
- [sendMessageBatch](squiss_ts_src.types.sqsfacade.md#sendmessagebatch)

## Properties

### changeMessageVisibility

• **changeMessageVisibility**: (`request`: [*ChangeMessageVisibilityRequest*](squiss_ts_src.types.changemessagevisibilityrequest.md)) => *Promise*<void\>

#### Type declaration:

▸ (`request`: [*ChangeMessageVisibilityRequest*](squiss_ts_src.types.changemessagevisibilityrequest.md)): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*ChangeMessageVisibilityRequest*](squiss_ts_src.types.changemessagevisibilityrequest.md) |

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:160

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:160

___

### createQueue

• **createQueue**: (`request`: [*CreateQueueRequest*](squiss_ts_src.types.createqueuerequest.md)) => *Promise*<[*CreateQueueResponse*](squiss_ts_src.types.createqueueresponse.md)\>

#### Type declaration:

▸ (`request`: [*CreateQueueRequest*](squiss_ts_src.types.createqueuerequest.md)): *Promise*<[*CreateQueueResponse*](squiss_ts_src.types.createqueueresponse.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*CreateQueueRequest*](squiss_ts_src.types.createqueuerequest.md) |

**Returns:** *Promise*<[*CreateQueueResponse*](squiss_ts_src.types.createqueueresponse.md)\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:161

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:161

___

### deleteMessageBatch

• **deleteMessageBatch**: (`request`: [*DeleteMessageBatchRequest*](squiss_ts_src.types.deletemessagebatchrequest.md)) => *Promise*<[*DeleteMessageBatchResponse*](squiss_ts_src.types.deletemessagebatchresponse.md)\>

#### Type declaration:

▸ (`request`: [*DeleteMessageBatchRequest*](squiss_ts_src.types.deletemessagebatchrequest.md)): *Promise*<[*DeleteMessageBatchResponse*](squiss_ts_src.types.deletemessagebatchresponse.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*DeleteMessageBatchRequest*](squiss_ts_src.types.deletemessagebatchrequest.md) |

**Returns:** *Promise*<[*DeleteMessageBatchResponse*](squiss_ts_src.types.deletemessagebatchresponse.md)\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:168

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:168

___

### deleteQueue

• **deleteQueue**: (`request`: [*DeleteQueueRequest*](squiss_ts_src.types.deletequeuerequest.md)) => *Promise*<void\>

#### Type declaration:

▸ (`request`: [*DeleteQueueRequest*](squiss_ts_src.types.deletequeuerequest.md)): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*DeleteQueueRequest*](squiss_ts_src.types.deletequeuerequest.md) |

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:162

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:162

___

### getEndpoint

• **getEndpoint**: () => *Promise*<UrlObject\>

#### Type declaration:

▸ (): *Promise*<UrlObject\>

**Returns:** *Promise*<UrlObject\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:169

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:169

___

### getQueueAttributes

• **getQueueAttributes**: <A\>(`request`: [*GetQueueAttributesRequest*](squiss_ts_src.types.getqueueattributesrequest.md)<A\>) => *Promise*<[*GetQueueAttributesResponse*](squiss_ts_src.types.getqueueattributesresponse.md)<A\>\>

#### Type declaration:

▸ <A\>(`request`: [*GetQueueAttributesRequest*](squiss_ts_src.types.getqueueattributesrequest.md)<A\>): *Promise*<[*GetQueueAttributesResponse*](squiss_ts_src.types.getqueueattributesresponse.md)<A\>\>

#### Type parameters:

Name | Type |
:------ | :------ |
`A` | keyof [*IQueueAttributes*](squiss_ts_src.types.iqueueattributes.md) |

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*GetQueueAttributesRequest*](squiss_ts_src.types.getqueueattributesrequest.md)<A\> |

**Returns:** *Promise*<[*GetQueueAttributesResponse*](squiss_ts_src.types.getqueueattributesresponse.md)<A\>\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:164

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:164

___

### getQueueUrl

• **getQueueUrl**: (`request`: [*GetQueueUrlRequest*](squiss_ts_src.types.getqueueurlrequest.md)) => *Promise*<[*GetQueueUrlResponse*](squiss_ts_src.types.getqueueurlresponse.md)\>

#### Type declaration:

▸ (`request`: [*GetQueueUrlRequest*](squiss_ts_src.types.getqueueurlrequest.md)): *Promise*<[*GetQueueUrlResponse*](squiss_ts_src.types.getqueueurlresponse.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*GetQueueUrlRequest*](squiss_ts_src.types.getqueueurlrequest.md) |

**Returns:** *Promise*<[*GetQueueUrlResponse*](squiss_ts_src.types.getqueueurlresponse.md)\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:163

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:163

___

### purgeQueue

• **purgeQueue**: (`request`: [*PurgeQueueRequest*](squiss_ts_src.types.purgequeuerequest.md)) => *Promise*<void\>

#### Type declaration:

▸ (`request`: [*PurgeQueueRequest*](squiss_ts_src.types.purgequeuerequest.md)): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*PurgeQueueRequest*](squiss_ts_src.types.purgequeuerequest.md) |

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:165

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:165

___

### receiveMessage

• **receiveMessage**: (`request`: [*ReceiveMessageRequest*](squiss_ts_src.types.receivemessagerequest.md)) => [*Abortable*](squiss_ts_src.types.abortable.md)<[*ReceiveMessageResponse*](squiss_ts_src.types.receivemessageresponse.md)\>

#### Type declaration:

▸ (`request`: [*ReceiveMessageRequest*](squiss_ts_src.types.receivemessagerequest.md)): [*Abortable*](squiss_ts_src.types.abortable.md)<[*ReceiveMessageResponse*](squiss_ts_src.types.receivemessageresponse.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*ReceiveMessageRequest*](squiss_ts_src.types.receivemessagerequest.md) |

**Returns:** [*Abortable*](squiss_ts_src.types.abortable.md)<[*ReceiveMessageResponse*](squiss_ts_src.types.receivemessageresponse.md)\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:159

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:159

___

### sendMessage

• **sendMessage**: (`request`: [*SendMessageRequest*](squiss_ts_src.types.sendmessagerequest.md)) => *Promise*<[*SendMessageResponse*](squiss_ts_src.types.sendmessageresponse.md)\>

#### Type declaration:

▸ (`request`: [*SendMessageRequest*](squiss_ts_src.types.sendmessagerequest.md)): *Promise*<[*SendMessageResponse*](squiss_ts_src.types.sendmessageresponse.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*SendMessageRequest*](squiss_ts_src.types.sendmessagerequest.md) |

**Returns:** *Promise*<[*SendMessageResponse*](squiss_ts_src.types.sendmessageresponse.md)\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:166

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:166

___

### sendMessageBatch

• **sendMessageBatch**: (`request`: [*SendMessageBatchRequest*](squiss_ts_src.types.sendmessagebatchrequest.md)) => *Promise*<[*SendMessageBatchResponse*](squiss_ts_src.types.sendmessagebatchresponse.md)\>

#### Type declaration:

▸ (`request`: [*SendMessageBatchRequest*](squiss_ts_src.types.sendmessagebatchrequest.md)): *Promise*<[*SendMessageBatchResponse*](squiss_ts_src.types.sendmessagebatchresponse.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`request` | [*SendMessageBatchRequest*](squiss_ts_src.types.sendmessagebatchrequest.md) |

**Returns:** *Promise*<[*SendMessageBatchResponse*](squiss_ts_src.types.sendmessagebatchresponse.md)\>

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:167

Defined in: node_modules/@squiss/core/lib/types/SQSFacade.d.ts:167
