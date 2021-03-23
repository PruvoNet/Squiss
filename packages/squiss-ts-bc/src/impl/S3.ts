import {S3} from 'aws-sdk';
import {Types, utils} from '@squiss/core';

class S3Impl implements Types.S3Facade {
    constructor(private readonly client: S3) {
    }

    public async deleteObject(request: Types.DeleteObjectRequest): Promise<void> {
        await this.client.deleteObject({
            ...request,
            Bucket: request.Bucket,
            Key: request.Key,
        }).promise();
    }

    public async getObject(request: Types.GetObjectRequest): Promise<Types.GetObjectResponse> {
        const response = await this.client.getObject({
            ...request,
            Bucket: request.Bucket,
            Key: request.Key,
        }).promise();
        const body = response.Body;
        if (!body) {
            throw new Error(`missing body in s3 object ${request.Bucket}/${request.Key}`);
        }
        return {
            Body: body.toString('utf-8'),
        };
    }

    public async putObject(request: Types.PutObjectRequest): Promise<void> {
        await this.client.putObject({
            ...request,
            Bucket: request.Bucket,
            Key: request.Key,
            Body: request.Body,
            ContentLength: request.ContentLength,
        }).promise();
    }
}


export const buildS3FacadeLazyGetter = (configuration: S3.ClientConfiguration, client?: S3 | typeof S3) => {
    return utils.buildLazyGetter<Types.S3Facade>(() => {
        const instance = utils.classGetter<S3, S3.ClientConfiguration>(S3, configuration, client);
        return new S3Impl(instance);
    })
}
