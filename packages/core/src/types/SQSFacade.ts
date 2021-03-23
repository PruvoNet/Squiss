import {UrlObject} from 'url';

export type QueueAttributeName =
    'All'
    | 'Policy'
    | 'VisibilityTimeout'
    | 'MaximumMessageSize'
    | 'MessageRetentionPeriod'
    | 'ApproximateNumberOfMessages'
    | 'ApproximateNumberOfMessagesNotVisible'
    | 'CreatedTimestamp'
    | 'LastModifiedTimestamp'
    | 'QueueArn'
    | 'ApproximateNumberOfMessagesDelayed'
    | 'DelaySeconds'
    | 'ReceiveMessageWaitTimeSeconds'
    | 'RedrivePolicy'
    | 'FifoQueue'
    | 'ContentBasedDeduplication'
    | 'KmsMasterKeyId'
    | 'KmsDataKeyReusePeriodSeconds'
    | 'DeduplicationScope'
    | 'FifoThroughputLimit'
    | string;

export interface ReceiveMessageRequest {
    QueueUrl: string;
    AttributeNames?: QueueAttributeName[];
    MessageAttributeNames?: string[];
    MaxNumberOfMessages?: number;
    VisibilityTimeout?: number;
    WaitTimeSeconds?: number;
    ReceiveRequestAttemptId?: string;
}

export interface SQSMessage {
    MessageId?: string;
    ReceiptHandle?: string;
    MD5OfBody?: string;
    Body?: string;
    Attributes?: Record<string, string>;
    MD5OfMessageAttributes?: string;
    MessageAttributes?: MessageBodyAttributeMap;
}

export interface ReceiveMessageResponse {
    Messages?: SQSMessage[];
}

export interface Abortable<Response> {
    promise: () => Promise<Response>;
    abort: () => void;
}

export interface ChangeMessageVisibilityRequest {
    QueueUrl: string;
    ReceiptHandle: string;
    VisibilityTimeout: number;
}

export interface IQueueAttributes {
    ReceiveMessageWaitTimeSeconds?: string;
    DelaySeconds?: string;
    MaximumMessageSize?: string;
    MessageRetentionPeriod?: string;
    VisibilityTimeout?: string;
    Policy?: string;
}

export interface CreateQueueRequest {
    QueueName: string;
    Attributes: IQueueAttributes;
}

export interface CreateQueueResponse {
    QueueUrl: string;
}

export interface DeleteQueueRequest {
    QueueUrl: string;
}

export interface GetQueueUrlRequest {
    QueueName: string;
    QueueOwnerAWSAccountId?: string;
}

export interface GetQueueUrlResponse {
    QueueUrl: string;
}

export interface GetQueueAttributesRequest<A extends keyof IQueueAttributes> {
    AttributeNames: A[];
    QueueUrl: string;
}

export interface GetQueueAttributesResponse<A extends keyof IQueueAttributes> {
    Attributes?: {
        [K in A]: IQueueAttributes[K];
    };
}

export interface PurgeQueueRequest {
    QueueUrl: string;
}

export type Binary = Buffer | Uint8Array | {} | string;
export type RequestBinary = Uint8Array;

export interface MessageAttributeValue {
    StringValue?: string;
    BinaryValue?: Binary;
    StringListValues?: string[];
    BinaryListValues?: Binary[];
    DataType?: string;
}

export interface RequestMessageAttributeValue {
    StringValue?: string;
    BinaryValue?: RequestBinary;
    StringListValues?: string[];
    BinaryListValues?: RequestBinary[];
    DataType: string;
}

export interface MessageSystemAttributeValue {
    StringValue?: string;
    BinaryValue?: RequestBinary;
    StringListValues?: string[];
    BinaryListValues?: RequestBinary[];
    DataType: string;
}

export type MessageBodyAttributeMap = Record<string, MessageAttributeValue>;
export type RequestMessageBodyAttributeMap = Record<string, RequestMessageAttributeValue>;
export type MessageBodySystemAttributeMap = Record<string, MessageSystemAttributeValue>;

export interface SendMessageRequest {
    QueueUrl: string;
    MessageBody: string;
    DelaySeconds?: number;
    MessageAttributes?: RequestMessageBodyAttributeMap;
    MessageDeduplicationId?: string;
    MessageGroupId?: string;
}

export interface SendMessageResponse {
    MD5OfMessageBody?: string;
    MD5OfMessageAttributes?: string;
    MD5OfMessageSystemAttributes?: string;
    MessageId?: string;
    SequenceNumber?: string;
}

export interface DeleteMessageBatchRequestEntry {
    Id: string;
    ReceiptHandle: string;
}

export interface DeleteMessageBatchRequest {
    QueueUrl: string;
    Entries: DeleteMessageBatchRequestEntry[],
}

export interface DeleteMessageBatchResultEntry {
    Id?: string;
}

export interface BatchResultErrorEntry {
    Id?: string;
    SenderFault?: boolean;
    Code?: string;
    Message?: string;
}

export interface DeleteMessageBatchResponse {
    Successful: DeleteMessageBatchResultEntry[];
    Failed: BatchResultErrorEntry[];
}

export interface SendMessageBatchRequestEntry {
    Id: string;
    MessageBody: string;
    DelaySeconds?: number;
    MessageAttributes?: RequestMessageBodyAttributeMap;
    MessageSystemAttributes?: MessageBodySystemAttributeMap;
    MessageDeduplicationId?: string;
    MessageGroupId?: string;
}

export interface SendMessageBatchRequest {
    QueueUrl: string;
    Entries: SendMessageBatchRequestEntry[];
}

export interface SendMessageBatchResultEntry {
    Id?: string;
    MessageId?: string;
    MD5OfMessageBody?: string;
    MD5OfMessageAttributes?: string;
    MD5OfMessageSystemAttributes?: string;
    SequenceNumber?: string;
}

export interface SendMessageBatchResponse {
    Successful: SendMessageBatchResultEntry[];
    Failed: BatchResultErrorEntry[];
}

export interface SQSFacade {
    receiveMessage: (request: ReceiveMessageRequest) => Abortable<ReceiveMessageResponse>;
    changeMessageVisibility: (request: ChangeMessageVisibilityRequest) => Promise<void>;
    createQueue: (request: CreateQueueRequest) => Promise<CreateQueueResponse>;
    deleteQueue: (request: DeleteQueueRequest) => Promise<void>;
    getQueueUrl: (request: GetQueueUrlRequest) => Promise<GetQueueUrlResponse>;
    getQueueAttributes: <A extends keyof IQueueAttributes>(request: GetQueueAttributesRequest<A>)
        => Promise<GetQueueAttributesResponse<A>>;
    purgeQueue: (request: PurgeQueueRequest) => Promise<void>;
    sendMessage: (request: SendMessageRequest) => Promise<SendMessageResponse>;
    sendMessageBatch: (request: SendMessageBatchRequest) => Promise<SendMessageBatchResponse>;
    deleteMessageBatch: (request: DeleteMessageBatchRequest) => Promise<DeleteMessageBatchResponse>;
    getEndpoint: () => Promise<UrlObject>;
}
