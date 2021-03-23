[Squiss-TS](../README.md) / [squiss-ts/src](../modules/squiss_ts_src.md) / [Types](../modules/squiss_ts_src.types.md) / IMessage

# Interface: IMessage

[squiss-ts/src](../modules/squiss_ts_src.md).[Types](../modules/squiss_ts_src.types.md).IMessage

## Hierarchy

* [*IMessageEmitter*](../modules/squiss_ts_src.types.md#imessageemitter)

  ↳ **IMessage**

## Table of contents

### Properties

- [ \_emitType](squiss_ts_src.types.imessage.md# _emittype)
- [ \_emitterType](squiss_ts_src.types.imessage.md# _emittertype)
- [ \_eventsType](squiss_ts_src.types.imessage.md# _eventstype)
- [attributes](squiss_ts_src.types.imessage.md#attributes)
- [body](squiss_ts_src.types.imessage.md#body)
- [raw](squiss_ts_src.types.imessage.md#raw)
- [sqsAttributes](squiss_ts_src.types.imessage.md#sqsattributes)
- [subject](squiss_ts_src.types.imessage.md#subject)
- [topicArn](squiss_ts_src.types.imessage.md#topicarn)
- [topicName](squiss_ts_src.types.imessage.md#topicname)

### Methods

- [addListener](squiss_ts_src.types.imessage.md#addlistener)
- [changeVisibility](squiss_ts_src.types.imessage.md#changevisibility)
- [del](squiss_ts_src.types.imessage.md#del)
- [emit](squiss_ts_src.types.imessage.md#emit)
- [eventNames](squiss_ts_src.types.imessage.md#eventnames)
- [getMaxListeners](squiss_ts_src.types.imessage.md#getmaxlisteners)
- [isHandled](squiss_ts_src.types.imessage.md#ishandled)
- [keep](squiss_ts_src.types.imessage.md#keep)
- [listenerCount](squiss_ts_src.types.imessage.md#listenercount)
- [listeners](squiss_ts_src.types.imessage.md#listeners)
- [off](squiss_ts_src.types.imessage.md#off)
- [on](squiss_ts_src.types.imessage.md#on)
- [once](squiss_ts_src.types.imessage.md#once)
- [parse](squiss_ts_src.types.imessage.md#parse)
- [prependListener](squiss_ts_src.types.imessage.md#prependlistener)
- [prependOnceListener](squiss_ts_src.types.imessage.md#prependoncelistener)
- [rawListeners](squiss_ts_src.types.imessage.md#rawlisteners)
- [release](squiss_ts_src.types.imessage.md#release)
- [removeAllListeners](squiss_ts_src.types.imessage.md#removealllisteners)
- [removeListener](squiss_ts_src.types.imessage.md#removelistener)
- [setMaxListeners](squiss_ts_src.types.imessage.md#setmaxlisteners)

## Properties

###  \_emitType

• `Optional` ** \_emitType**: [*IMessageEvents*](squiss_ts_src.types.imessageevents.md)

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:4

___

###  \_emitterType

• `Optional` ** \_emitterType**: *EventEmitter*

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:2

___

###  \_eventsType

• `Optional` ** \_eventsType**: [*IMessageEvents*](squiss_ts_src.types.imessageevents.md)

Inherited from: void

Defined in: node_modules/@squiss/core/lib/types/eventEmitter.d.ts:3

___

### attributes

• `Readonly` **attributes**: IMessageAttributes

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:30

___

### body

• `Optional` `Readonly` **body**: *any*

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:26

___

### raw

• `Readonly` **raw**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`Attributes`? | *Record*<string, string\> |
`Body`? | *string* |
`MD5OfBody`? | *string* |
`MD5OfMessageAttributes`? | *string* |
`MessageAttributes`? | [*MessageBodyAttributeMap*](../modules/squiss_ts_src.types.md#messagebodyattributemap) |
`MessageId`? | *string* |
`ReceiptHandle`? | *string* |

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:25

___

### sqsAttributes

• `Readonly` **sqsAttributes**: *object*

#### Type declaration:

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:31

___

### subject

• `Optional` `Readonly` **subject**: *string*

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:27

___

### topicArn

• `Optional` `Readonly` **topicArn**: *string*

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:28

___

### topicName

• `Optional` `Readonly` **topicName**: *string*

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:29

## Methods

### addListener

▸ **addListener**<P, T\>(`event`: P, `listener`: (...`args`: *ListenerType*<[*IMessageEvents*](squiss_ts_src.types.imessageevents.md)[P]\>) => *void*): T

#### Type parameters:

Name | Type |
:------ | :------ |
`P` | keyof [*IMessageEvents*](squiss_ts_src.types.imessageevents.md) |
`T` | - |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | P |
`listener` | (...`args`: *ListenerType*<[*IMessageEvents*](squiss_ts_src.types.imessageevents.md)[P]\>) => *void* |

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

### changeVisibility

▸ **changeVisibility**(`timeoutInSeconds`: *number*): *Promise*<void\>

#### Parameters:

Name | Type |
:------ | :------ |
`timeoutInSeconds` | *number* |

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:39

___

### del

▸ **del**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:36

___

### emit

▸ **emit**<P, T\>(`event`: P, ...`args`: *ListenerType*<[*IMessageEvents*](squiss_ts_src.types.imessageevents.md)[P]\>): T

#### Type parameters:

Name | Type |
:------ | :------ |
`P` | keyof [*IMessageEvents*](squiss_ts_src.types.imessageevents.md) |
`T` | - |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | P |
`...args` | *ListenerType*<[*IMessageEvents*](squiss_ts_src.types.imessageevents.md)[P]\> |

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

### isHandled

▸ **isHandled**(): *boolean*

**Returns:** *boolean*

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:35

___

### keep

▸ **keep**(): *void*

**Returns:** *void*

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:37

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

▸ **on**<P, T\>(`event`: P, `listener`: (...`args`: *ListenerType*<[*IMessageEvents*](squiss_ts_src.types.imessageevents.md)[P]\>) => *void*): T

#### Type parameters:

Name | Type |
:------ | :------ |
`P` | keyof [*IMessageEvents*](squiss_ts_src.types.imessageevents.md) |
`T` | - |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | P |
`listener` | (...`args`: *ListenerType*<[*IMessageEvents*](squiss_ts_src.types.imessageevents.md)[P]\>) => *void* |

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

▸ **once**<P, T\>(`event`: P, `listener`: (...`args`: *ListenerType*<[*IMessageEvents*](squiss_ts_src.types.imessageevents.md)[P]\>) => *void*): T

#### Type parameters:

Name | Type |
:------ | :------ |
`P` | keyof [*IMessageEvents*](squiss_ts_src.types.imessageevents.md) |
`T` | - |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | P |
`listener` | (...`args`: *ListenerType*<[*IMessageEvents*](squiss_ts_src.types.imessageevents.md)[P]\>) => *void* |

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

### parse

▸ **parse**(): *Promise*<any\>

**Returns:** *Promise*<any\>

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:34

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

### release

▸ **release**(): *Promise*<void\>

**Returns:** *Promise*<void\>

Defined in: node_modules/@squiss/core/lib/types/IMessage.d.ts:38

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
`P` | keyof [*IMessageEvents*](squiss_ts_src.types.imessageevents.md) |
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

### setMaxListeners

▸ **setMaxListeners**(`n`: *number*): *EventEmitter*

#### Parameters:

Name | Type |
:------ | :------ |
`n` | *number* |

**Returns:** *EventEmitter*

Inherited from: void

Defined in: node_modules/@types/node/events.d.ts:68
