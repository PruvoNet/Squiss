import {brotliCompress, brotliDecompress} from 'zlib';
import {promisify} from 'util';
import {utils} from '@squiss/core';

const compress = promisify(brotliCompress);
const decompress = promisify(brotliDecompress);

export const messageGzip: utils.MessageGzip = utils.getMessageGzip({
    compress,
    decompress,
})
