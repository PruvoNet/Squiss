import {compress, decompress} from 'iltorb';
import {utils} from '@squiss/core';

export const messageGzip: utils.MessageGzip = utils.getMessageGzip({
    compress,
    decompress,
})
