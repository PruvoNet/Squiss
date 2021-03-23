[Squiss-TS](../README.md) / [squiss-ts/src](../modules/squiss_ts_src.md) / [Types](../modules/squiss_ts_src.types.md) / ISquiss

# Interface: ISquiss

[squiss-ts/src](../modules/squiss_ts_src.md).[Types](../modules/squiss_ts_src.types.md).ISquiss

## Hierarchy

* [*ISquissEmitter*](../modules/squiss_ts_src.types.md#isquissemitter)

  ↳ **ISquiss**

## Table of contents

### Properties

- [ \_emitType](squiss_ts_src.types.isquiss.md# _emittype)
- [ \_emitterType](squiss_ts_src.types.isquiss.md# _emittertype)
- [ \_eventsType](squiss_ts_src.types.isquiss.md# _eventstype)
- [inFlight](squiss_ts_src.types.isquiss.md#inflight)
- [running](squiss_ts_src.types.isquiss.md#running)

### Methods

- [addListener](squiss_ts_src.types.isquiss.md#addlistener)
- [changeMessageVisibility](squiss_ts_src.types.isquiss.md#changemessagevisibility)
- [createQueue](squiss_ts_src.types.isquiss.md#createqueue)
- [deleteMessage](squiss_ts_src.types.isquiss.md#deletemessage)
- [deleteQueue](squiss_ts_src.types.isquiss.md#deletequeue)
- [emit](squiss_ts_src.types.isquiss.md#emit)
- [eventNames](squiss_ts_src.types.isquiss.md#eventnames)
- [getMaxListeners](squiss_ts_src.types.isquiss.md#getmaxlisteners)
- [getQueueMaximumMessageSize](squiss_ts_src.types.isquiss.md#getqueuemaximummessagesize)
- [getQueueUrl](squiss_ts_src.types.isquiss.md#getqueueurl)
- [getQueueVisibilityTimeout](squiss_ts_src.types.isquiss.md#getqueuevisibilitytimeout)
- [getS3](squiss_ts_src.types.isquiss.md#gets3)
- [handledMessage](squiss_ts_src.types.isquiss.md#handledmessage)
- [listenerCount](squiss_ts_src.types.isquiss.md#listenercount)
- [listeners](squiss_ts_src.types.isquiss.md#listeners)
- [off](squiss_ts_src.types.isquiss.md#off)
- [on](squiss_ts_src.types.isquiss.md#on)
- [once](squiss_ts_src.types.isquiss.md#once)
- [prependListener](squiss_ts_src.types.isquiss.md#prependlistener)
- [prependOnceListener](squiss_ts_src.types.isquiss.md#prependoncelistener)
- [purgeQueue](squiss_ts_src.types.isquiss.md#purgequeue)
- [rawListeners](squiss_ts_src.types.isquiss.md#rawlisteners)
- [releaseMessage](squiss_ts_src.types.isquiss.md#releasemessage)
- [removeAllListeners](squiss_ts_src.types.isquiss.md#removealllisteners)
- [removeListener](squiss_ts_src.types.isquiss.md#removelistener)
- [sendMessage](squiss_ts_src.types.isquiss.md#sendmessage)
- [sendMessages](squiss_ts_src.types.isquiss.md#sendmessages)
- [setMaxListeners](squiss_ts_src.types.isquiss.md#setmaxlisteners)
- [start](squiss_ts_src.types.isquiss.md#start)
- [stop](squiss_ts_src.types.isquiss.md#stop)

## Properties

###  \_emitType

• `Optional` ** \_emitType**: [*ISquissEvents*](squiss_ts_src.types.isquissevents.md)

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:4

___

###  \_emitterType

• `Optional` ** \_emitterType**: *EventEmitter*

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:2

___

###  \_eventsType

• `Optional` ** \_eventsType**: [*ISquissEvents*](squiss_ts_src.types.isquissevents.md)

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:3

___

### inFlight

• `Readonly` **inFlight**: *number*

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:106

___

### running

• `Readonly` **running**: *boolean*

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:107

## Methods

### addListener

▸ **addListener**<P, T\>(`event`: P, `listener`: (...`args`: *ListenerType*<[*ISquissEvents*](squiss_ts_src.types.isquissevents.md)[P]\>) => *void*): T

#### Type parameters:

Name | Type |
:------ | :------ |
`P` | keyof [*ISquissEvents*](squiss_ts_src.types.isquissevents.md) |
`T` | - |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | P |
`listener` | (...`args`: *ListenerType*<[*ISquissEvents*](squiss_ts_src.types.isquissevents.md)[P]\>) => *void* |

**Returns:** T

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:13

▸ **addListener**(`event`: *typeof* assignmentCompatibilityHack, `listener`: (...`args`: *any*[]) => *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *typeof* assignmentCompatibilityHack |
`listener` | (...`args`: *any*[]) => *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:14

___

### changeMessageVisibility

▸ **changeMessageVisibility**(`msg`: *string* \| [*IMessage*](squiss_ts_src.types.imessage.md), `timeoutInSeconds`: *number*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`msg` | *string* \| [*IMessage*](squiss_ts_src.types.imessage.md) |
`timeoutInSeconds` | *number* |

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:108

___

### createQueue

▸ **createQueue**(): *Promise*<string\>

**Returns:** *Promise*<string\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:109

___

### deleteMessage

▸ **deleteMessage**(`msg`: [*IMessage*](squiss_ts_src.types.imessage.md)): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`msg` | [*IMessage*](squiss_ts_src.types.imessage.md) |

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:110

___

### deleteQueue

▸ **deleteQueue**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:111

___

### emit

▸ **emit**<P, T\>(`event`: P, ...`args`: *ListenerType*<[*ISquissEvents*](squiss_ts_src.types.isquissevents.md)[P]\>): T

#### Type parameters:

Name | Type |
:------ | :------ |
`P` | keyof [*ISquissEvents*](squiss_ts_src.types.isquissevents.md) |
`T` | - |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | P |
`...args` | *ListenerType*<[*ISquissEvents*](squiss_ts_src.types.isquissevents.md)[P]\> |

**Returns:** T

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:23

▸ **emit**(`event`: *typeof* assignmentCompatibilityHack, ...`args`: *any*[]): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *typeof* assignmentCompatibilityHack |
`...args` | *any*[] |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:24

___

### eventNames

▸ **eventNames**(): (*string* \| *symbol*)[]

**Returns:** (*string* \| *symbol*)[]

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:77

___

### getMaxListeners

▸ **getMaxListeners**(): *number*

**Returns:** *number*

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:69

___

### getQueueMaximumMessageSize

▸ **getQueueMaximumMessageSize**(): *Promise*<number\>

**Returns:** *Promise*<number\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:114

___

### getQueueUrl

▸ **getQueueUrl**(): *Promise*<string\>

**Returns:** *Promise*<string\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:112

___

### getQueueVisibilityTimeout

▸ **getQueueVisibilityTimeout**(): *Promise*<number\>

**Returns:** *Promise*<number\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:113

___

### getS3

▸ **getS3**(): [*S3Facade*](squiss_ts_src.types.s3facade.md)

**Returns:** [*S3Facade*](squiss_ts_src.types.s3facade.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:122

___

### handledMessage

▸ **handledMessage**(`msg`: [*IMessage*](squiss_ts_src.types.imessage.md)): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`msg` | [*IMessage*](squiss_ts_src.types.imessage.md) |

**Returns:** *void*

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:115

___

### listenerCount

▸ **listenerCount**(`event`: *string* \| *symbol*): *number*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |

**Returns:** *number*

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:73

___

### listeners

▸ **listeners**(`event`: *string* \| *symbol*): Function[]

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |

**Returns:** Function[]

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:70

___

### off

▸ **off**(`event`: *string* \| *symbol*, `listener`: (...`args`: *any*[]) => *void*): *EventEmitter*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`listener` | (...`args`: *any*[]) => *void* |

**Returns:** *EventEmitter*

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:66

___

### on

▸ **on**<P, T\>(`event`: P, `listener`: (...`args`: *ListenerType*<[*ISquissEvents*](squiss_ts_src.types.isquissevents.md)[P]\>) => *void*): T

#### Type parameters:

Name | Type |
:------ | :------ |
`P` | keyof [*ISquissEvents*](squiss_ts_src.types.isquissevents.md) |
`T` | - |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | P |
`listener` | (...`args`: *ListenerType*<[*ISquissEvents*](squiss_ts_src.types.isquissevents.md)[P]\>) => *void* |

**Returns:** T

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:11

▸ **on**(`event`: *typeof* assignmentCompatibilityHack, `listener`: (...`args`: *any*[]) => *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *typeof* assignmentCompatibilityHack |
`listener` | (...`args`: *any*[]) => *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:12

___

### once

▸ **once**<P, T\>(`event`: P, `listener`: (...`args`: *ListenerType*<[*ISquissEvents*](squiss_ts_src.types.isquissevents.md)[P]\>) => *void*): T

#### Type parameters:

Name | Type |
:------ | :------ |
`P` | keyof [*ISquissEvents*](squiss_ts_src.types.isquissevents.md) |
`T` | - |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | P |
`listener` | (...`args`: *ListenerType*<[*ISquissEvents*](squiss_ts_src.types.isquissevents.md)[P]\>) => *void* |

**Returns:** T

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:21

▸ **once**(`event`: *typeof* assignmentCompatibilityHack, `listener`: (...`args`: *any*[]) => *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *typeof* assignmentCompatibilityHack |
`listener` | (...`args`: *any*[]) => *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:22

___

### prependListener

▸ **prependListener**(`event`: *string* \| *symbol*, `listener`: (...`args`: *any*[]) => *void*): *EventEmitter*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`listener` | (...`args`: *any*[]) => *void* |

**Returns:** *EventEmitter*

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:75

___

### prependOnceListener

▸ **prependOnceListener**(`event`: *string* \| *symbol*, `listener`: (...`args`: *any*[]) => *void*): *EventEmitter*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |
`listener` | (...`args`: *any*[]) => *void* |

**Returns:** *EventEmitter*

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:76

___

### purgeQueue

▸ **purgeQueue**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:117

___

### rawListeners

▸ **rawListeners**(`event`: *string* \| *symbol*): Function[]

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |

**Returns:** Function[]

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:71

___

### releaseMessage

▸ **releaseMessage**(`msg`: [*IMessage*](squiss_ts_src.types.imessage.md)): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`msg` | [*IMessage*](squiss_ts_src.types.imessage.md) |

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:116

___

### removeAllListeners

▸ **removeAllListeners**(`event?`: *string* \| *symbol*): *EventEmitter*

#### Parameters:

Name | Type |
:------ | :------ |
`event?` | *string* \| *symbol* |

**Returns:** *EventEmitter*

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:67

___

### removeListener

▸ **removeListener**<P, T\>(`event`: P, `listener`: (...`args`: *any*[]) => *any*): T

#### Type parameters:

Name | Type |
:------ | :------ |
`P` | keyof [*ISquissEvents*](squiss_ts_src.types.isquissevents.md) |
`T` | - |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | P |
`listener` | (...`args`: *any*[]) => *any* |

**Returns:** T

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:17

▸ **removeListener**(`event`: *typeof* assignmentCompatibilityHack, `listener`: (...`args`: *any*[]) => *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *typeof* assignmentCompatibilityHack |
`listener` | (...`args`: *any*[]) => *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:18

___

### sendMessage

▸ **sendMessage**(`message`: [*IMessageToSend*](../modules/squiss_ts_src.types.md#imessagetosend), `delay?`: *number*, `attributes?`: IMessageAttributes): *Promise*<[*SendMessageResponse*](squiss_ts_src.types.sendmessageresponse.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`message` | [*IMessageToSend*](../modules/squiss_ts_src.types.md#imessagetosend) |
`delay?` | *number* |
`attributes?` | IMessageAttributes |

**Returns:** *Promise*<[*SendMessageResponse*](squiss_ts_src.types.sendmessageresponse.md)\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:118

___

### sendMessages

▸ **sendMessages**(`messages`: [*IMessageToSend*](../modules/squiss_ts_src.types.md#imessagetosend) \| [*IMessageToSend*](../modules/squiss_ts_src.types.md#imessagetosend)[], `delay?`: *number*, `attributes?`: IMessageAttributes \| IMessageAttributes[]): *Promise*<[*SendMessageBatchResponse*](squiss_ts_src.types.sendmessagebatchresponse.md)\>

#### Parameters:

Name | Type |
:------ | :------ |
`messages` | [*IMessageToSend*](../modules/squiss_ts_src.types.md#imessagetosend) \| [*IMessageToSend*](../modules/squiss_ts_src.types.md#imessagetosend)[] |
`delay?` | *number* |
`attributes?` | IMessageAttributes \| IMessageAttributes[] |

**Returns:** *Promise*<[*SendMessageBatchResponse*](squiss_ts_src.types.sendmessagebatchresponse.md)\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:119

___

### setMaxListeners

▸ **setMaxListeners**(`n`: *number*): *EventEmitter*

#### Parameters:

Name | Type |
:------ | :------ |
`n` | *number* |

**Returns:** *EventEmitter*

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:68

___

### start

▸ **start**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:120

___

### stop

▸ **stop**(`soft?`: *boolean*, `timeout?`: *number*): *Promise*<boolean\>

#### Parameters:

Name | Type |
:------ | :------ |
`soft?` | *boolean* |
`timeout?` | *number* |

**Returns:** *Promise*<boolean\>

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:121
