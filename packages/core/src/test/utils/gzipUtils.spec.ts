import {getMessageGzip} from '../../utils/gzipUtils';

const {compressMessage, decompressMessage} = getMessageGzip({
    compress: async (buf: Buffer): Promise<Buffer> => {
        return buf;
    },
    decompress: async (buf: Buffer): Promise<Buffer> => {
        return buf;
    },
});

describe('gzip utils', () => {

    it('should compress message', () => {
        return compressMessage('{"i": 1}')
            .then((gzipped) => {
                gzipped.should.eql('eyJpIjogMX0=');
            });
    });

    it('should decompress message', () => {
        return decompressMessage('eyJpIjogMX0=')
            .then((parsed) => {
                parsed.should.eql('{"i": 1}');
            });
    });

    it('compressed and decompressed valued should be equal', () => {
        const message = '{"i": 1}';
        return compressMessage(message)
            .then((gzipped) => {
                return decompressMessage(gzipped);
            })
            .then((parsed) => {
                parsed.should.eql(message);
            });
    });
});
