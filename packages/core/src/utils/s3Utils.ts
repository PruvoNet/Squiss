
import {v4 as uuidv4} from 'uuid';
import {getSizeInBytes} from './messageSizeUtils';
import {S3Facade} from '../types/S3Facade';

export const S3_MARKER = '__SQS_S3__';

export interface IS3Upload {
    bucket: string;
    key: string;
    uploadSize: number;
}

export const uploadBlob = async (s3: S3Facade, bucket: string, blob: string, prefix: string): Promise<IS3Upload> => {
    const key = `${prefix}${uuidv4()}`;
    const size = getSizeInBytes(blob);
    await s3.putObject({
        Body: blob,
        Bucket: bucket,
        Key: key,
        ContentLength: size,
    })
    return {
        uploadSize: size,
        bucket,
        key,
    };
};

export const getBlob = async (s3: S3Facade, uploadData: IS3Upload): Promise<string> => {
    const key = uploadData.key;
    const bucket = uploadData.bucket;
    const {Body} = await s3.getObject({
        Key: key,
        Bucket: bucket,
    })
    return Body;
};

export const deleteBlob = async (s3: S3Facade, uploadData: IS3Upload): Promise<void> => {
    const key = uploadData.key;
    const bucket = uploadData.bucket;
    await s3.deleteObject({
        Key: key,
        Bucket: bucket,
    });
};
