export const GZIP_MARKER = '__SQS_GZIP__';

export type Compressor = (buf: Buffer) => Promise<Buffer>;
export type MessageCompressor = (i: string) => Promise<string>;

export interface Gzip {
    compress: Compressor;
    decompress: Compressor;
}

export interface MessageGzip {
    compressMessage: MessageCompressor;
    decompressMessage: MessageCompressor;
}

export const getMessageGzip = ({compress, decompress}: Gzip): MessageGzip => {
    return {
        compressMessage: async (message: string): Promise<string> => {
            const buffer = await compress(Buffer.from(message));
            return Buffer.from(buffer).toString('base64');
        },
        decompressMessage: async (body: string): Promise<string> => {
            const buffer = await decompress(Buffer.from(body, 'base64'))
            return buffer.toString('utf8');
        },
    }
}
