import * as Core from '@squiss/core';
import {messageGzip} from './utils/gzip';
import {buildS3FacadeLazyGetter} from './impl/S3';
import {buildSQSFacadeLazyGetter} from './impl/SQS';
import {S3Client, S3ClientConfig} from '@aws-sdk/client-s3';
import {SQSClient, SQSClientConfig} from '@aws-sdk/client-sqs';
import {ISquiss, ISquissOptions} from '@squiss/core/lib/types/ISquiss';

export import Types = Core.Types;

export type IAwsConfig = Types.IAwsConfig<SQSClientConfig,
    SQSClient,
    S3ClientConfig,
    S3Client,
    typeof SQSClient,
    typeof S3Client>;
export type Squiss = (opts: ISquissOptions, awsConfig?: IAwsConfig) => ISquiss;

export const squiss: Squiss = Core.squissBuilder<SQSClientConfig,
    SQSClient,
    S3ClientConfig,
    S3Client,
    typeof SQSClient,
    typeof S3Client>({
    messageGzip,
    buildS3FacadeLazyGetter,
    buildSQSFacadeLazyGetter,
});
