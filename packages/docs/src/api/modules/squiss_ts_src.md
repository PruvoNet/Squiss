[Squiss-TS](../README.md) / squiss-ts/src

# Module: squiss-ts/src

## Table of contents

### Namespaces

- [Types](squiss_ts_src.types.md)

### Type aliases

- [IAwsConfig](squiss_ts_src.md#iawsconfig)
- [Squiss](squiss_ts_src.md#squiss)

### Functions

- [squiss](squiss_ts_src.md#squiss)

## Type aliases

### IAwsConfig

Ƭ **IAwsConfig**: [*IAwsConfig*](squiss_ts_src.types.md#iawsconfig)<SQSClientConfig, SQSClient, S3ClientConfig, S3Client, *typeof* SQSClient, *typeof* S3Client\>

Defined in: [packages/squiss-ts/src/index.ts:11](https://github.com/PruvoNet/Squiss/blob/621a7aa/packages/squiss-ts/src/index.ts#L11)

___

### Squiss

Ƭ **Squiss**: (`opts`: [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md), `awsConfig?`: [*IAwsConfig*](squiss_ts_src.md#iawsconfig)) => [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

#### Type declaration:

▸ (`opts`: [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md), `awsConfig?`: [*IAwsConfig*](squiss_ts_src.md#iawsconfig)): [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

#### Parameters:

Name | Type |
:------ | :------ |
`opts` | [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md) |
`awsConfig?` | [*IAwsConfig*](squiss_ts_src.md#iawsconfig) |

**Returns:** [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

Defined in: [packages/squiss-ts/src/index.ts:17](https://github.com/PruvoNet/Squiss/blob/621a7aa/packages/squiss-ts/src/index.ts#L17)

## Functions

### squiss

▸ `Const`**squiss**(`opts`: [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md), `awsConfig?`: [*IAwsConfig*](squiss_ts_src.md#iawsconfig)): [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

#### Parameters:

Name | Type |
:------ | :------ |
`opts` | [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md) |
`awsConfig?` | [*IAwsConfig*](squiss_ts_src.md#iawsconfig) |

**Returns:** [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

Defined in: [packages/squiss-ts/src/index.ts:19](https://github.com/PruvoNet/Squiss/blob/621a7aa/packages/squiss-ts/src/index.ts#L19)
