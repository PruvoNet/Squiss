import {S3Facade} from './S3Facade';
import {SQSFacade} from './SQSFacade';
import {Constructor} from '../utils/utils';

export type IAwsConfig<SQSClientConfig, ISQSClient, S3ClientConfig, IS3Client,
    SQSClient extends Constructor<ISQSClient, SQSClientConfig> = Constructor<ISQSClient, SQSClientConfig>,
    S3Client extends Constructor<IS3Client, S3ClientConfig> = Constructor<IS3Client, S3ClientConfig>> = {
    s3?:
        {
            configuration?: S3ClientConfig;
            client?: IS3Client | S3Client;
        } |
        {
            facade: S3Facade;
        };
    sqs?:
        {
            configuration?: SQSClientConfig;
            client?: ISQSClient | SQSClient;
        } |
        {
            facade: SQSFacade;
        };
}
