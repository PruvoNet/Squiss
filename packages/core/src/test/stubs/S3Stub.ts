
import {EventEmitter} from 'events';
import {
    GetObjectRequest,
    S3Facade,
    PutObjectRequest,
    GetObjectResponse,
    DeleteObjectRequest
} from '../../types/S3Facade';

export interface Blobs {
    [k: string]: { [k: string]: string };
}

export class S3Stub extends EventEmitter implements S3Facade {

    private blobs: Blobs;

    constructor(blobs?: Blobs) {
        super();
        this.blobs = blobs || {};
    }

    public async getObject({Key, Bucket}: GetObjectRequest): Promise<GetObjectResponse> {
        if (this.blobs[Bucket] && this.blobs[Bucket][Key]) {
            return {Body: this.blobs[Bucket][Key]};
        } else {
            throw new Error('Blob doesnt exist');
        }
    }

    public async putObject({Key, Bucket, Body}: PutObjectRequest): Promise<void> {
        if (!this.blobs[Bucket]) {
            this.blobs[Bucket] = {};
        }
        this.blobs[Bucket][Key] = Body;
    }

    public async deleteObject({Key, Bucket}: DeleteObjectRequest): Promise<void> {
        if (this.blobs[Bucket] && this.blobs[Bucket][Key]) {
            delete this.blobs[Bucket][Key];
        } else {
            throw new Error('Blob doesnt exist');
        }
    }

}
