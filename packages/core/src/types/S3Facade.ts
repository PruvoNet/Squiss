export interface PutObjectRequest {
    Body: string;
    Bucket: string;
    Key: string;
    ContentLength: number;
}

export interface GetObjectRequest {
    Bucket: string;
    Key: string;
}

export interface GetObjectResponse {
    Body: string;
}

export interface DeleteObjectRequest {
    Bucket: string;
    Key: string;
}

export interface S3Facade {
    putObject: (request: PutObjectRequest) => Promise<void>;
    getObject: (request: GetObjectRequest) => Promise<GetObjectResponse>;
    deleteObject: (request: DeleteObjectRequest) => Promise<void>;
}
