import * as Core from '@squiss/core';
import {messageGzip} from './utils/gzip';
import {buildS3FacadeLazyGetter} from './impl/S3';
import {buildSQSFacadeLazyGetter} from './impl/SQS';
import {S3, SQS} from 'aws-sdk';
import {ISquiss, ISquissOptions} from '@squiss/core/lib/types/ISquiss';

export import Types = Core.Types;

export type IAwsConfig = Types.IAwsConfig<SQS.ClientConfiguration, SQS, S3.ClientConfiguration, S3, typeof SQS,
    typeof S3>;
export type Squiss = (opts: ISquissOptions, awsConfig?: IAwsConfig) => ISquiss;

export const squiss: Squiss = Core.squissBuilder<SQS.ClientConfiguration, SQS, S3.ClientConfiguration, S3, typeof SQS,
    typeof S3>({
    messageGzip,
    buildS3FacadeLazyGetter,
    buildSQSFacadeLazyGetter,
});
