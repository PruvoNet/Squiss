import {compress, decompress} from 'iltorb';
import {getMessageGzip, MessageGzip} from '../../utils/gzipUtils';

export const testMessageGzip: MessageGzip = getMessageGzip({
    compress,
    decompress,
})
