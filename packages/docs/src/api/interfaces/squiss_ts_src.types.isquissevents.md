[Squiss-TS](../README.md) / [squiss-ts/src](../modules/squiss_ts_src.md) / [Types](../modules/squiss_ts_src.types.md) / ISquissEvents

# Interface: ISquissEvents

[squiss-ts/src](../modules/squiss_ts_src.md).[Types](../modules/squiss_ts_src.types.md).ISquissEvents

## Table of contents

### Properties

- [aborted](squiss_ts_src.types.isquissevents.md#aborted)
- [autoExtendError](squiss_ts_src.types.isquissevents.md#autoextenderror)
- [autoExtendFail](squiss_ts_src.types.isquissevents.md#autoextendfail)
- [delError](squiss_ts_src.types.isquissevents.md#delerror)
- [delQueued](squiss_ts_src.types.isquissevents.md#delqueued)
- [deleted](squiss_ts_src.types.isquissevents.md#deleted)
- [drained](squiss_ts_src.types.isquissevents.md#drained)
- [error](squiss_ts_src.types.isquissevents.md#error)
- [extendingTimeout](squiss_ts_src.types.isquissevents.md#extendingtimeout)
- [gotMessages](squiss_ts_src.types.isquissevents.md#gotmessages)
- [handled](squiss_ts_src.types.isquissevents.md#handled)
- [keep](squiss_ts_src.types.isquissevents.md#keep)
- [maxInFlight](squiss_ts_src.types.isquissevents.md#maxinflight)
- [message](squiss_ts_src.types.isquissevents.md#message)
- [queueEmpty](squiss_ts_src.types.isquissevents.md#queueempty)
- [released](squiss_ts_src.types.isquissevents.md#released)
- [s3Delete](squiss_ts_src.types.isquissevents.md#s3delete)
- [s3Download](squiss_ts_src.types.isquissevents.md#s3download)
- [s3Upload](squiss_ts_src.types.isquissevents.md#s3upload)
- [timeoutExtended](squiss_ts_src.types.isquissevents.md#timeoutextended)
- [timeoutReached](squiss_ts_src.types.isquissevents.md#timeoutreached)

## Properties

### aborted

• **aborted**: Error

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:96

___

### autoExtendError

• **autoExtendError**: [*IMessageErrorEventPayload*](squiss_ts_src.types.imessageerroreventpayload.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:99

___

### autoExtendFail

• **autoExtendFail**: [*IMessageErrorEventPayload*](squiss_ts_src.types.imessageerroreventpayload.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:98

___

### delError

• **delError**: [*IMessageDeleteErrorEventPayload*](squiss_ts_src.types.imessagedeleteerroreventpayload.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:97

___

### delQueued

• **delQueued**: [*IMessage*](squiss_ts_src.types.imessage.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:82

___

### deleted

• **deleted**: [*IMessageDeletedEventPayload*](squiss_ts_src.types.imessagedeletedeventpayload.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:93

___

### drained

• **drained**: *void*

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:90

___

### error

• **error**: Error

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:95

___

### extendingTimeout

• **extendingTimeout**: [*IMessage*](squiss_ts_src.types.imessage.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:86

___

### gotMessages

• **gotMessages**: *number*

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:94

___

### handled

• **handled**: [*IMessage*](squiss_ts_src.types.imessage.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:83

___

### keep

• **keep**: [*IMessage*](squiss_ts_src.types.imessage.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:89

___

### maxInFlight

• **maxInFlight**: *void*

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:92

___

### message

• **message**: [*IMessage*](squiss_ts_src.types.imessage.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:88

___

### queueEmpty

• **queueEmpty**: *void*

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:91

___

### released

• **released**: [*IMessage*](squiss_ts_src.types.imessage.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:84

___

### s3Delete

• **s3Delete**: [*IMessageS3EventPayload*](squiss_ts_src.types.imessages3eventpayload.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:101

___

### s3Download

• **s3Download**: [*IMessageS3EventPayload*](squiss_ts_src.types.imessages3eventpayload.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:100

___

### s3Upload

• **s3Upload**: IS3Upload

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:102

___

### timeoutExtended

• **timeoutExtended**: [*IMessage*](squiss_ts_src.types.imessage.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:87

___

### timeoutReached

• **timeoutReached**: [*IMessage*](squiss_ts_src.types.imessage.md)

Defined in: node_modules/@squiss/core/lib/types/ISquiss.d.ts:85
