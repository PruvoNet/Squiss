[Squiss-TS](../README.md) / squiss-ts-bc/src

# Module: squiss-ts-bc/src

## Table of contents

### References

- [Types](squiss_ts_bc_src.md#types)

### Type aliases

- [IAwsConfig](squiss_ts_bc_src.md#iawsconfig)
- [Squiss](squiss_ts_bc_src.md#squiss)

### Functions

- [squiss](squiss_ts_bc_src.md#squiss)

## References

### Types

Re-exports: [Types](squiss_ts_src.types.md)

## Type aliases

### IAwsConfig

Ƭ **IAwsConfig**: [*IAwsConfig*](squiss_ts_src.types.md#iawsconfig)<SQS.ClientConfiguration, SQS, S3.ClientConfiguration, S3, *typeof* SQS, *typeof* S3\>

Defined in: [packages/squiss-ts-bc/src/index.ts:10](https://github.com/PruvoNet/Squiss/blob/621a7aa/packages/squiss-ts-bc/src/index.ts#L10)

___

### Squiss

Ƭ **Squiss**: (`opts`: [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md), `awsConfig?`: [*IAwsConfig*](squiss_ts_bc_src.md#iawsconfig)) => [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

#### Type declaration:

▸ (`opts`: [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md), `awsConfig?`: [*IAwsConfig*](squiss_ts_bc_src.md#iawsconfig)): [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

#### Parameters:

Name | Type |
:------ | :------ |
`opts` | [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md) |
`awsConfig?` | [*IAwsConfig*](squiss_ts_bc_src.md#iawsconfig) |

**Returns:** [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

Defined in: [packages/squiss-ts-bc/src/index.ts:12](https://github.com/PruvoNet/Squiss/blob/621a7aa/packages/squiss-ts-bc/src/index.ts#L12)

## Functions

### squiss

▸ `Const`**squiss**(`opts`: [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md), `awsConfig?`: [*IAwsConfig*](squiss_ts_bc_src.md#iawsconfig)): [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

#### Parameters:

Name | Type |
:------ | :------ |
`opts` | [*ISquissOptions*](../interfaces/squiss_ts_src.types.isquissoptions.md) |
`awsConfig?` | [*IAwsConfig*](squiss_ts_bc_src.md#iawsconfig) |

**Returns:** [*ISquiss*](../interfaces/squiss_ts_src.types.isquiss.md)

Defined in: [packages/squiss-ts-bc/src/index.ts:14](https://github.com/PruvoNet/Squiss/blob/621a7aa/packages/squiss-ts-bc/src/index.ts#L14)
