import {ISquiss, ISquissOptions} from './types/ISquiss';
import {IAwsConfig} from './types/awsConfig';
import {Constructor, isFacadeConfig} from './utils/utils';
import {Squiss} from './impl/Squiss';
import {MessageGzip} from './utils/gzipUtils';
import {S3Facade} from './types/S3Facade';
import {SQSFacade} from './types/SQSFacade';

export * as utils from './utils/_api';
export * as Types from './types/_api';

export type IFacadeLazyGetterBuilder<F, T, A, C extends Constructor<T, A> = Constructor<T, A>> =
    (configuration: A, client?: T | C) => () => F;

export interface SquissBuilderOpts<SQSClientConfig, ISQSClient, S3ClientConfig, IS3Client,
    SQSClient extends Constructor<ISQSClient, SQSClientConfig> = Constructor<ISQSClient, SQSClientConfig>,
    S3Client extends Constructor<IS3Client, S3ClientConfig> = Constructor<IS3Client, S3ClientConfig>> {
    messageGzip: MessageGzip;
    buildS3FacadeLazyGetter: IFacadeLazyGetterBuilder<S3Facade, IS3Client, S3ClientConfig, S3Client>;
    buildSQSFacadeLazyGetter: IFacadeLazyGetterBuilder<SQSFacade, ISQSClient, SQSClientConfig, SQSClient>;
}

export const squissBuilder = <SQSClientConfig, ISQSClient, S3ClientConfig, IS3Client,
    SQSClient extends Constructor<ISQSClient, SQSClientConfig> = Constructor<ISQSClient, SQSClientConfig>,
    S3Client extends Constructor<IS3Client, S3ClientConfig> = Constructor<IS3Client, S3ClientConfig>>
({
     messageGzip,
     buildS3FacadeLazyGetter,
     buildSQSFacadeLazyGetter,
 }
     : SquissBuilderOpts<SQSClientConfig,
    ISQSClient,
    S3ClientConfig,
    IS3Client,
    SQSClient, S3Client>
) =>
    (opts: ISquissOptions, awsConfig?: IAwsConfig<SQSClientConfig,
        ISQSClient,
        S3ClientConfig,
        IS3Client,
        SQSClient,
        S3Client>): ISquiss => {
        const s3Config = awsConfig?.s3;
        const s3 = isFacadeConfig(s3Config) ?
            s3Config.facade :
            buildS3FacadeLazyGetter(s3Config?.configuration ?? {} as S3ClientConfig, s3Config?.client);
        const sqsConfig = awsConfig?.sqs;
        const sqs = isFacadeConfig(sqsConfig) ?
            sqsConfig.facade :
            buildSQSFacadeLazyGetter(sqsConfig?.configuration ?? {} as SQSClientConfig, sqsConfig?.client);
        return new Squiss({
            ...opts,
            messageGzip,
            SQS: sqs,
            S3: s3,
        });
    }
